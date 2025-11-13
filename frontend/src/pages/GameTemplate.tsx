
import { useNavigate } from "react-router";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import { useState, useEffect } from "react";
import { useLearning } from "../context/LearningContext";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";
import { Mosaic } from "react-loading-indicators";



const GameTemplate = () => {
    //VARIJABLE
    const [Loading, setLoading] = useState<boolean>(false);
 

    //KONTEKSTI
    const navigate = useNavigate();
    const learn = useLearning();

    //FUNKCIJE
   

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col items-center justify-start w-screen">
                {Loading ? (
                    <div className="min-h-screen flex items-center justify-center">
                       <Mosaic color="var(--color-primary-dark)" size="medium" text="" textColor="" />
                    </div>
                ) : (
                    <>
                        <div className={"absolute z-0 w-screen h-screen "}>
                            <Particles 
                                particleColors={['#ffffff', '#ffffff']}
                                particleCount={150}
                                particleSpread={8}
                                speed={0.08}
                                particleBaseSize={180}
                                moveParticlesOnHover={true}
                                alphaParticles={false}
                                disableRotation={false}
                            />
                        </div>

                        {/* Header */}
                        <Header />
                        {/* Main Content */}
                        {/* PITANJE */}
        
                       
                      

            
              
                    </>
                )}
            </div>   
           
        </PageTransition>

        
    );
};


export default GameTemplate;