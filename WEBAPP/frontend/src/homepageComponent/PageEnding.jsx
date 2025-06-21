import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";


const PageEnding=()=>{
     const navigate = useNavigate();
      function goToLoginPage() {
        navigate("/login");
      }
    return (
<>
   <section className="bg-gray-50 text-gray-900 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-lg text-gray-800 mb-8">
              Join our community of learners and teachers today!
            </p>
            <Button
              onClick={goToLoginPage}
              className="bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-all"
            >
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </section>
</>
    );
}

export default PageEnding;