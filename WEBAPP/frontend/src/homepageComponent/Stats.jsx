import React from "react";
import { motion } from "framer-motion";
const Stats=()=>{
    return (
        <>
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "1K+", label: "Active Users" },
              { number: "10K+", label: "Skills Exchanged" },
              { number: "100K+", label: "Learning Hours" },
              { number: "4.6/5", label: "User Rating" }
            ].map((stat,index) => (
              <motion.div
                key={index}
                className="text-center bg-white rounded-xl shadow-sm p-8 hover:scale-105 transition-transform duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-extrabold text-black">
                  {stat.number}
                </div>
                <div className="text-gray-600 mt-2 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
        </>
    )
}

export default Stats;