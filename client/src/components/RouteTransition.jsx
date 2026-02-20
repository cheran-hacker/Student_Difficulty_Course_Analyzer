import { motion } from 'framer-motion';

const variants = {
    initial: { opacity: 0, x: -20 },
    enter: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
};

const RouteTransition = ({ children }) => {
    return (
        <motion.div
            initial="initial"
            animate="enter"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full"
        >
            {children}
        </motion.div>
    );
};

export default RouteTransition;
