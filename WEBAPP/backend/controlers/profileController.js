import { sql} from "../config/idb.js";

export const getUserInfo =async (req,res)=>{
    try {
        const userid=req.user.userid;
        const reponse =await sql`
        SELECT full_name as username,email
        FROM users2
        WHERE userid=${userid}
        `
        const coinRes=await sql`
        SELECT balance
        FROM skillcoin2
        WHERE userid=${userid}
        `
        const reponseObject={
          username:reponse[0].username,
          email:reponse[0].email,
          skillcoins:coinRes[0].balance
        };
       res.json(reponseObject);
    }
    catch (error ){
        console.log("error occured while geting profile user details");
        res.status(500).json ({error:"unable retrive user detailss"});
    }
};
export const getStats = async (req, res) => {
  try {
    const userid = req.user.userid;

    // Lifetime total courses created
    const totalCoursesResult = await sql`
      SELECT COUNT(courseid) AS "totalCourses"
      FROM courses2
      WHERE userid = ${userid}
    `;

    // Courses created in the last 30 days
    const monthlyCoursesResult = await sql`
      SELECT COUNT(courseid) AS "monthlyCourses"
      FROM courses2
      WHERE userid = ${userid}
      AND createdAt >= NOW() - INTERVAL '30 days'
    `;

    // Average rating on all courses (non-zero)
    const avgCourseRatingResult = await sql`
      SELECT AVG(rating) AS "avgCourseRating"
      FROM course_post_details2
      WHERE courseid IN (
        SELECT courseid FROM courses2 WHERE userid = ${userid}
      ) AND rating != 0
    `;

    // Lifetime total doubt replies
    const totalDoubtsResult = await sql`
      SELECT COUNT(doubt_replies_id) AS "totalDoubts"
      FROM doubt_replies2
      WHERE userid = ${userid}
    `;

    // Doubt replies in the last 30 days
    const monthlyDoubtsResult = await sql`
      SELECT COUNT(doubt_replies_id) AS "monthlyDoubts"
      FROM doubt_replies2
      WHERE userid = ${userid}
      AND createdAt >= NOW() - INTERVAL '30 days'
    `;

    // Average rating on doubt replies
    const avgDoubtRatingResult = await sql`
      SELECT AVG(rating) AS "avgDoubtRating"
      FROM reply_details2
      WHERE doubt_replies_id IN (
        SELECT doubt_replies_id FROM doubt_replies2 WHERE userid = ${userid}
      ) AND rating != 0
    `;
    // Lifetime earnings from Marketplace
const totalMarketplaceEarnings = await sql`
  SELECT COALESCE(SUM(amount), 0) AS "totalMarketplace"
  FROM course_transactions2
  WHERE ownerid = ${userid}
`;

// Earnings from Marketplace in the last 30 days
const monthlyMarketplaceEarnings = await sql`
  SELECT COALESCE(SUM(amount), 0) AS "monthlyMarketplace"
  FROM course_transactions2
  WHERE ownerid = ${userid}
  AND transaction_date >= NOW() - INTERVAL '30 days'
`;

// Lifetime earnings from Doubts
const totalDoubtEarnings = await sql`
  SELECT COALESCE(SUM(amount), 0) AS "totalDoubt"
  FROM doubt_transactions2
  WHERE ownerid = ${userid}
`;

// Earnings from Doubts in the last 30 days
const monthlyDoubtEarnings = await sql`
  SELECT COALESCE(SUM(amount), 0) AS "monthlyDoubt"
  FROM doubt_transactions2
  WHERE ownerid = ${userid}
  AND transaction_date >= NOW() - INTERVAL '30 days'
`;

res.json({
  totalCourses: Number(totalCoursesResult[0].totalCourses) || 0,
  monthlyCourses: Number(monthlyCoursesResult[0].monthlyCourses) || 0,
  avgCourseRating: parseFloat(avgCourseRatingResult[0].avgCourseRating || 0).toFixed(1),

  totalDoubts: Number(totalDoubtsResult[0].totalDoubts) || 0,
  monthlyDoubts: Number(monthlyDoubtsResult[0].monthlyDoubts) || 0,
  avgDoubtRating: parseFloat(avgDoubtRatingResult[0].avgDoubtRating || 0).toFixed(1),

  lifetimeEarningsMarketplace: parseFloat(totalMarketplaceEarnings[0].totalMarketplace).toFixed(2),
  monthlyEarningsMarketplace: parseFloat(monthlyMarketplaceEarnings[0].monthlyMarketplace).toFixed(2),
  lifetimeEarningsDoubt: parseFloat(totalDoubtEarnings[0].totalDoubt).toFixed(2),
  monthlyEarningsDoubt: parseFloat(monthlyDoubtEarnings[0].monthlyDoubt).toFixed(2),
});

  } catch (error) {
    console.error("Error in getStats:", error);
    res.status(500).json({ error: "Error while getting stats" });
  }
};


export const getStreak=async (req,res)=> {
  try {
    const userid=req.user.userid;
    const reponse=await sql`
    SELECT DATE(time) as date, COUNT(*) as count
    FROM recent_activity2
    WHERE userid = ${userid}
  AND time >= NOW() - INTERVAL '2 months'
  GROUP BY date
    `
    res.json(reponse);
  }
  catch(error) {
    console.log("error while fecthinh recent activity data for streak");
    res.status(500).json({error:"error while fetching data for streak"});
  }
}

export const getRecentActivity=async(req,res)=>{
    try {
      const userid=req.user.userid;
      const response=await sql`
      SELECT type,activity
      FROM recent_activity2
      WHERE userid=${userid}
      `
      res.json(response);
    }
    catch(error ) {
      console.log("error while getting recent activity");
      res.status(500).json({error:"error while fetching recent activity"});
    }
}

export const getEarnings = async (req, res) => {
  try {
    const userid = req.user.userid;

    // Fetch course transactions
    const courseResults = await sql`
      SELECT transaction_date, amount, 'Marketplace' AS source
      FROM course_transactions2
      WHERE ownerid = ${userid}
      AND transaction_date >= NOW() - INTERVAL '30 days'
    `;

    // Fetch doubt transactions
    const doubtResults = await sql`
      SELECT transaction_date, amount, 'Doubt' AS source
      FROM doubt_transactions2
      WHERE ownerid = ${userid}
      AND transaction_date >= NOW() - INTERVAL '30 days'
    `;

    // Fetch doubt reply transactions
    const doubtReplyResults = await sql`
      SELECT transaction_date, amount, 'Doubt Reply' AS source
      FROM doubt_reply_transactions2
      WHERE userid = ${userid}
      AND transaction_date >= NOW() - INTERVAL '30 days'
    `;

    // Merge all results
    const combinedResults = [...courseResults, ...doubtResults, ...doubtReplyResults];

    // Sort by transaction_date (latest first)
    combinedResults.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

    // Format the messages
    const formattedMessages = combinedResults.map(row => {
      const date = row.transaction_date.toISOString().split('T')[0];
      return `💰 On ${date}, you received 🪙${parseFloat(row.amount).toFixed(2)} from ${row.source}`;
    });

    res.json(formattedMessages);
  } catch (error) {
    console.log("Error while fetching earnings:", error);
    res.status(500).json({ error: "Unable to fetch earnings" });
  }
};
