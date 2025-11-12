
import { useNavigate } from "react-router";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import { useState } from "react";
import Header from "../components/Header";
const Home = () => {

    //KONTEKSTI
    const navigate = useNavigate();
   

    //VARIJABLE
    const [selectedMode, setSelectedMode] = useState<string | null>(null);

    


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
                <div className="flex w-full items-start justify-start mb-8 lg:mb-4">
                <div className="bg-[var(--color-primary-extra-dark)] z-10 rounded-r-full py-6 lg:py-4 px-16 lg:px-12 text-on-primary font-space text-2xl lg:text-xl font-semibold">Odaberite način učenja:</div>
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
                onClick={() => navigate('/learningSession')}
                className="mt-8 lg:mt-4 w-full py-4 lg:py-3 bg-(--color-primary-dark) text-on-dark font-space rounded-full disabled:opacity-30"
            >
                Dalje
            </button>
        </div>
        
            </div>   
           
        </PageTransition>

        
    );
};


export default Home;