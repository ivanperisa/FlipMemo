
import { useNavigate } from "react-router";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import { useState } from "react";
import Header from "../components/Header";
import { useLearning } from "../context/LearningContext";
const Home = () => {

    //KONTEKSTI
    const navigate = useNavigate();
   

    //VARIJABLE
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const {setGameMode} = useLearning();

    //MODELI
    const learningModes = [
    { id: 'translate-from', label: 'prevedi sa stranog jezika', icon: '🌍' },
    { id: 'translate-to', label: 'prevedi na strani jezik', icon: '📖' },
    { id: 'listening', label: 'slušanje', icon: '🎧' },
    { id: 'speaking', label: 'govor', icon: '🎤' },
];

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col items-center justify-start w-screen">
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
            <div className="flex flex-col w-full items-start justify-start mb-5 gap-3">
                <div className="bg-[var(--color-primary-extra-dark)] z-10 rounded-r-full py-6 px-16 text-on-primary font-space text-2xl font-semibold">Odaberite način učenja:</div>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="bg-[var(--color-primary-light)] z-10 rounded-r-full py-6 px-16 text-[var(--color-text-on-primary)] font-space text-2xl font-semibold cursor-pointer transition-all transform hover:bg-[var(--color-primary-dark)] hover:text-[var(--color-text-on-primary)] hover:scale-105 focus:outline-none"
                >
                    Natrag
                </button>
            </div>

    {/* OPCIJE I GUMB */}
    <div className="w-full max-w-[600px] rounded-3xl px-8 z-10 mx-5 my-0 flex flex-col justify-center lg:h-auto">
        <div className="space-y-4 lg:space-y-2">
                {learningModes.map(mode => (
                    <button
                    key={mode.id}
                    onClick={() => {setSelectedMode(mode.id);
                             
                    }}
                    className={`
                        w-full flex items-center gap-4 px-6 py-4 lg:py-3 lg:px-4
                        bg-white rounded-full shadow-md
                        transition-all
                        cursor-pointer
                        ${selectedMode === mode.id 
                            ? 'ring-4 ring-[var(--color-primary-dark)] bg-[var(--color-primary-light)]' 
                            : 'hover:shadow-lg hover:scale-102'
                        }
                    `}
    >
        {/* Pink circle indicator */}
        <div className={`
            w-6 h-6 lg:w-5 lg:h-5 rounded-full border-2 
            ${selectedMode === mode.id 
                ? 'bg-[var(--color-primary-dark)] border-[var(--color-primary-dark)]' 
                : 'bg-white border-gray-300'
            }
        `} />
        
        {/* Label */}
        <span className="font-space text-[#8B6B7A] lg:text-sm">
            {mode.label}
        </span>
    </button>
                ))}
            </div>
            
            {/* Gumb za nastavak */}
            <button 
                disabled={!selectedMode}
                onClick={() => {
                    if (selectedMode) {
                        setGameMode(selectedMode as 'translate-from' | 'translate-to' | 'listening' | 'speaking');
                    }
                    if (selectedMode === 'translate-from' || selectedMode === 'translate-to') {
                        navigate("/translateQuestion");
                    } else if (selectedMode === 'listening') {
                        navigate("/listeningQuestion");
                    } else if (selectedMode === 'speaking') {
                        navigate("/speakingQuestion");
                    }
                }}
                className={`mt-8 lg:mt-4 w-full py-4 lg:py-3 bg-(--color-primary-dark) text-on-dark font-space rounded-full disabled:opacity-30 ${selectedMode && 'cursor-pointer'}`}
            >
                Dalje
            </button>
        </div>
        
            </div>   
           
        </PageTransition>

        
    );
};


export default Home;
