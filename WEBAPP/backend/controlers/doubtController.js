import { sql} from "../config/idb.js";
import { generateGeminiReply } from "../config/ai.js";
import { generateOpenAIReply } from "../config/ai.js";
export const getDoubts = async (req, res) => {
  try {
    const { topic } = req.query;

    const doubts = topic
      ? await sql`
          SELECT 
            d.doubtid,
            d.title,
            d.question,
            d.topic,
            d.createdat,
            d.userid,
            u.full_name AS author
          FROM doubts2 d
          JOIN users2 u ON d.userid = u.userid
          WHERE d.topic = ${topic}
          ORDER BY d.createdat DESC
        `
      : await sql`
          SELECT 
            d.doubtid,
            d.title,
            d.question,
            d.topic,
            d.createdat,
            d.userid,
            u.full_name AS author
          FROM doubts2 d
          JOIN users2 u ON d.userid = u.userid
          ORDER BY d.createdat DESC
        `;

    res.json(doubts);
  } catch (error) {
    console.error('Error fetching doubts', error);
    res.status(500).json({ error: 'Failed to fetch doubts' });
  }
};



export const createDoubt = async (req, res) => {
  try {
    const { title, question, topic } = req.body;
    const userid = req.user.userid;

    // 1. Insert doubt
    const [doubt] = await sql`
      INSERT INTO doubts2 (title, question, userid, topic)
      VALUES (${title}, ${question}, ${userid}, ${topic})
      RETURNING 
        doubts2.*, 
        (SELECT full_name FROM users2 WHERE userid = ${userid}) AS author
    `;

    // 2. Log activity
    const type1 = "Posted a Question";
    const activity1 = `Question asked : ${question}`;
    await sql`
      INSERT INTO recent_activity2 (userid, type, activity)
      VALUES (${userid}, ${type1}, ${activity1})
    `;

    // 3. Respond early to frontend
    res.status(201).json(doubt);

    // 4. Background AI reply generation (non-blocking)
    setImmediate(async () => {
      const aiReplies = [];

      try {
        const geminiReply = await generateGeminiReply(question);
        if (geminiReply) {
          aiReplies.push({ reply: geminiReply, model: "Gemini" });
        }
      } catch (err) {
        console.warn("Gemini AI error:", err.message);
      }

      try {
        const openaiReply = await generateOpenAIReply(question);
        if (openaiReply) {
          aiReplies.push({ reply: openaiReply, model: "OpenAI" });
        }
      } catch (err) {
        console.warn("OpenAI AI error:", err.message);
      }

      // 5. Save AI replies (if any)
      for (const { reply, model } of aiReplies) {
        try {
          await sql`
            INSERT INTO ai_doubt_replies2 (doubtid, reply, model_name)
            VALUES (${doubt.doubtid}, ${reply}, ${model})
          `;
        } catch (insertErr) {
          console.error("Error saving AI reply:", insertErr.message);
        }
      }
    });

  } catch (error) {
    console.error("Error creating doubt:", error);
    res.status(500).json({ error: "Failed to create doubt" });
  }
};

export const getUserDoubts=async (req, res) => {
  try {
    const userid = req.user.userid;
    
    const doubts= await sql`
      SELECT 
        d.*,
        u.full_name as author
      FROM doubts2 d
      JOIN users2 u ON d.userid = u.userid
      WHERE d.userid = ${userid}
      ORDER BY d.createdAt DESC
    `;
    res.json(doubts);
  } catch (error) {
    console.error('Error fetching user  doubts:', error);
    res.status(500).json({ error: 'Failed to fetch user doubts' });
  }
};


export const getReplies = async (req, res) => {     
  try {          
    const { doubtid } = req.params;          
    const userid = req.user.userid;         

    // Fetch AI reply for this doubt
    const [aiReply] = await sql`
      SELECT reply, model_name, createdAt
      FROM ai_doubt_replies2
      WHERE doubtid = ${doubtid}
    `;

    // Fetch all human replies for this doubt
    const userReplies = await sql`      
      SELECT      
        d.doubt_replies_id,     
        d.userid AS reply_userid,     
        d.reply,     
        d.createdat,     
        u.full_name AS author,     
        COALESCE(r.rating, 0) AS rating,     
        COALESCE(r.is_liked, false) AS is_liked   
      FROM doubt_replies2 d   
      JOIN users2 u ON d.userid = u.userid   
      LEFT JOIN reply_details2 r      
        ON r.doubt_replies_id = d.doubt_replies_id AND r.userid = ${userid}   
      WHERE d.doubtid = ${doubtid}   
      ORDER BY d.createdat ASC;
    `;          

    // Combine and send both
    res.json({
      ai_reply: aiReply || null,
      user_replies: userReplies
    });     
  }     
  catch (error) {         
    console.log("error occurred while fetching replies", error);         
    res.status(500).json({ error: "failed to fetch replies of doubt" });     
  }  
};



export const addReply = async (req, res) => {
  try {
    const { doubtid } = req.params;
    const userid = req.user.userid;
    const { reply } = req.body;

    if (!reply || reply.trim() === "") {
      return res.status(400).json({ error: "Reply cannot be empty" });
    }

    // Insert reply
    const [newReply] = await sql`
      INSERT INTO doubt_replies2 (doubtid, userid, reply)
      VALUES (${doubtid}, ${userid}, ${reply})
      RETURNING *
    `;

    // Insert into recent activity
    const preview = reply.length > 60 ? reply.slice(0, 57) + "..." : reply;
    const type1 = "Replied to Question";
    const activity1 = `Answered to Question: ${preview}`;
    await sql`
      INSERT INTO recent_activity2 (userid, type, activity)
      VALUES (${userid}, ${type1}, ${activity1})
    `;

    // Ensure skillcoin row exists
    await sql`
      INSERT INTO skillcoin2 (userid, balance)
      VALUES (${userid}, 0)
      ON CONFLICT (userid) DO NOTHING
    `;

    // Update coin balance
    await sql`
      UPDATE skillcoin2
      SET balance = balance + 10
      WHERE userid = ${userid}
    `;

    // Log transaction
    await sql`
      INSERT INTO doubt_reply_transactions2 (doubt_replies_id, userid, amount)
      VALUES (${newReply.doubt_replies_id}, ${userid}, 10)
    `;

    res.json(newReply);
  } catch (error) {
    console.error("Error occurred while posting reply:", error);
    res.status(500).json({ error: "Failed to post reply of doubt" });
  }
};


export const updateReplyRating = async (req, res) => {
  try {
    const { replyid, rating } = req.body;
    const userid = req.user.userid;

    //  Get previous rating if exists
    const existing = await sql`
      SELECT rating FROM reply_details2
      WHERE userid = ${userid} AND doubt_replies_id = ${replyid}
    `;
    const oldRating = existing.length ? existing[0].rating : 0;

    //  Get the reply author
    const reply = await sql`
      SELECT userid FROM doubt_replies2
      WHERE doubt_replies_id = ${replyid}
    `;
    if (!reply.length) {
      return res.status(404).json({ error: "Reply not found" });
    }
    const reply_owner = reply[0].userid;

    // Calculate coin diff
    const oldPoints = 2 * oldRating;
    const newPoints = 2 * rating;
    const diff = newPoints - oldPoints;

    // Update reply_details2 (insert or update rating)
    const reply_details = await sql`
      INSERT INTO reply_details2 (doubt_replies_id, userid, rating)
      VALUES (${replyid}, ${userid}, ${rating})
      ON CONFLICT (userid, doubt_replies_id)
      DO UPDATE SET rating = ${rating}
      RETURNING *
    `;

    // 5. Update skillcoin only if diff ≠ 0
    if (diff !== 0) {
      await sql`
        INSERT INTO skillcoin2 (userid, balance)
        VALUES (${reply_owner}, ${diff})
        ON CONFLICT (userid)
        DO UPDATE SET balance = skillcoin2.balance + ${diff}, lastupdate = NOW()
      `;
await sql`
    INSERT INTO doubt_transactions2  (ownerid,poster_id,amount,doubt_replies_id) VALUES (${reply_owner},${userid},${diff},${replyid});
`
}

    res.json(reply_details);
  } catch (error) {
    console.log("error occurred while updating reply rating:", error);
    res.status(500).json({ error: "failed to update reply rating" });
  }
};


export const toggleReplyLike =async (req,res)=>{
          try {
         const { replyid,isLiked} = req.body;
        const userid = req.user.userid;

        const reply_details= await sql`
        INSERT INTO reply_details2 (doubt_replies_id, userid)
         VALUES (${replyid}, ${userid})
           ON CONFLICT (doubt_replies_id, userid)
           DO UPDATE SET is_liked = ${isLiked}
         RETURNING *;
`;

res.json(reply_details);

    }
    catch (error) {
      console.log("error occurecd while updating reply ratings ");
      res.status(500).json({error:"failed to update reply  rating "});
    }
}

export const getAverageReplyRating = async(req,res)=> {
  try {
  const { replyid } = req.query;

  const result = await sql`
    SELECT ROUND(avg(rating),1) as "avgRating"
    FROM reply_details2 
    WHERE doubt_replies_id = ${replyid} AND rating != 0
  `;

  let averageRating=0;
    if(result.length==0) {return res.json(averageRating);}
    averageRating = result[0].avgRating; 

  res.json(averageRating );
} catch (error) {
  console.log("Error while getting average rating:", error.message);
  res.status(500).json({ error: "Failed to get average reply rating" });
}
}

