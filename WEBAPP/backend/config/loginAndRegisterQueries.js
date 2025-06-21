import { sql } from './idb.js';


// Link Google account to existing user or create new user
export const linkGoogleAccount = async ({ email, full_name, google_id }) => {
  try {
    // Check if user already exists
    const isPresent = await sql`
      SELECT userid FROM users2 WHERE email= ${email};
    `;
    let userid;
    if (isPresent.length > 0) {
      // User exists: update last login
      userid = isPresent[0].userid;
      await sql`
        UPDATE users2
        SET lastlogin = NOW()
        WHERE userid = ${userid};
      `;
    } else {
      // User doesn't exist: insert new
      const inserted = await sql`
        INSERT INTO users2 (email, full_name, googleid, lastlogin)
        VALUES (${email}, ${full_name}, ${google_id}, NOW())
        RETURNING userid;
      `;
      userid = inserted[0].userid;
      await sql`INSERT INTO skillcoin2 (userid,balance) values (${userid},${500})`;
      let type="create";
      let activity="Created an account with google "
      console.log("after skill coin creation");
      await sql`INSERT INTO recent_activity2 (userid,type,activity) values (${userid},${type},${activity})  `
      await sql`INSERT INTO recent_activity2 (userid,type,activity) values (${userid},${"credit_coin"},${"creditied 500 coins for creating account"}) `
      console.log("after recent activites updatedd");
    }
    return { userid, email, full_name, google_id };
  } catch (error) {
    console.log("Error while creating or updating Google account:", error.message);
    throw error;
  }
};

export const checkEmailExists = async (email) => {
  try {
    const isPresent = await sql`
      SELECT userid, googleid FROM users2 WHERE email = ${email}
    `;
    return isPresent.length>0 ? isPresent:null;
  } catch (error) {
    console.log("Error while checking email");
    throw error;
  }
};


export const createUser = async ({ email, full_name, hashed_password }) => {
  try {
    const user = await sql`
      INSERT INTO users2 (email, full_name, hashed_password)
      VALUES (${email}, ${full_name}, ${hashed_password})
      RETURNING userid
    `;
    const userid = user[0].userid;

    await sql`
      INSERT INTO skillcoin2 (userid, balance)
      VALUES (${userid}, ${500})
    `;
    console.log("after skill coin insertion");
      let type="create";
     let activity="Created an account with email";
     let type2="credit_coin";
     let activity2="Credited 500 skill coin";
      await sql`INSERT INTO recent_activity2 (userid,type,activity) VALUES (${userid},${type},${activity})  `
      await sql`INSERT INTO recent_activity2 (userid,type,activity) VALUES (${userid},${type2},${activity2}) `
      console.log("after recent activites updatedd");
    return { userid, email, full_name };
  } catch (error) {
    console.log("Error while adding new user");
    throw error;
  }
};

export const findUser = async (email) => {
  try {
    const user = await sql`
      SELECT userid, full_name, hashed_password, googleid
      FROM users2 WHERE email = ${email}
    `;
       return user.length > 0 ? user[0] : null;
  } catch (error) {
    console.log("Error while finding user");
    throw error;
  }
};


export const updateLastLogin = async (userid) => {
  try {
    await sql`
      UPDATE users2
      SET lastLogin = NOW()
      WHERE userid = ${userid}
    `;
  } catch (error) {
    console.log("Error while updating last login");
    throw error;
  }
};

export const getUserById =async (userid) =>{
    try {
    const user = await sql`
      SELECT userid
      FROM users2 WHERE userid = ${userid}
    `;
       return user.length > 0 ? user[0] : null;
  } catch (error) {
    console.log("Error while finding user");
    throw error;
  }
}