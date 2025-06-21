import { sql} from "./idb.js";

export const getRecentActivity = async (userid) => {
  try {
    const activity = await sql`
      SELECT userid, type, activity, time 
      FROM recent_activity2 
      WHERE userid = ${userid} 
      ORDER BY time DESC 
      LIMIT 5;
    `;
    return activity;
  } catch (error) {
    console.log("error while fetching recent activity");
    return error;
  }
};
