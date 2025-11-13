
import { useNavigate } from "react-router";
import { useState } from "react";
import { Mosaic } from "react-loading-indicators";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import Header from "../components/Header";
import { useLearning } from "../context/LearningContext";

const GameTemplate = () => {
    // VARIJABLE
    const [Loading, setLoading] = useState<boolean>(false);

    // KONTEKSTI
    const navigate = useNavigate();

    // FUNKCIJE

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col items-center justify-start w-screen">
                {Loading ? (
                    <div className="min-h-screen flex items-center justify-center">
                        <Mosaic 
                            color="var(--color-primary-dark)" 
                            size="medium" 
                            text="" 
                            textColor="" 
                        />
                    </div>
                ) : (
                    <>
                        {/* Background Particles */}
                        <div className="absolute z-0 w-screen h-screen">
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

                        {/* Main Layout */}
                        <div className="h-[100vh] w-full flex flex-col items-center justify-between relative z-10">
                            {/* Header */}
                            <Header />

                            {/* Main content - Game container */}
                            <div className="flex flex-col items-center justify-start w-full flex-1 z-10 pb-8">
                                {/* Game box */}
                                <div className="z-10 w-[50vw] h-[50vh] flex items-center justify-center mt-20 bg-white/80 rounded-lg shadow-lg backdrop-blur-lg border border-black min-w-[350px] max-w-[700px]">
                                    {/* Game content will go here */}
                                </div>

                                {/* Game answer button */}
                                <button
                                    onClick={() => console.log("hello")}
                                    type="button"
                                    className="rounded-full bg-(--color-primary-dark) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl 
                                    text-on-dark shadow-lg font-space text-[18px] tracking-wide hover:cursor-pointer z-1 mt-10">
                                    Odgovori
                                </button>
                            </div>

                            {/* Game bowls - Fixed at bottom - Hidden on mobile */}
                            <div className="hidden md:flex w-full h-32 items-end justify-center gap-4 z-10">
                                {/* Bowl 1 - Sad */}
                                <div className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all">
                                    <span className="font-space text-sm text-white">sad</span>
                                    <span className="font-space text-lg text-white font-bold mt-1">5</span>
                                </div>

                                {/* Bowl 2 - Danas */}
                                <div className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all">
                                    <span className="font-space text-sm text-white">danas</span>
                                    <span className="font-space text-lg text-white font-bold mt-1">5</span>
                                </div>

                                {/* Bowl 3 - Sutra */}
                                <div className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all">
                                    <span className="font-space text-sm text-white">sutra</span>
                                    <span className="font-space text-lg text-white font-bold mt-1">5</span>
                                </div>

                                {/* Bowl 4 - Tjedan */}
                                <div className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all">
                                    <span className="font-space text-sm text-white">tjedan</span>
                                    <span className="font-space text-lg text-white font-bold mt-1">5</span>
                                </div>

                                {/* Bowl 5 - Naučeno */}
                                <div className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all">
                                    <span className="font-space text-sm text-white">naučeno</span>
                                    <span className="font-space text-lg text-white font-bold mt-1">5</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </PageTransition>
    );
};

export default GameTemplate;