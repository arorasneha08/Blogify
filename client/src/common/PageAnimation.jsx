import {AnimatePresence , motion} from "framer-motion"; 

const AnimationWrapper = ({children ,keyValue , initial = {opacity : 0 } , animate = {opacity : 1}} , transition = {duration : 1} , className) => {
    return (
        <AnimatePresence>
            <motion.div 
                key={keyValue}
                initial={initial} 
                animate={animate} 
                transition={transition}
                className={className}
                >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
 
export default AnimationWrapper ;  

// for the key property , to apply different animation for page reload and for switching between the signup and signin we need to know the type , key refers to that only ..