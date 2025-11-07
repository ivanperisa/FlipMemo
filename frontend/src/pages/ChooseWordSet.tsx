
import { useNavigate } from "react-router";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import { useState } from "react";
import { useLearning } from "../context/LearningContext";
import Header from "../components/Header";

const Home = () => {

    //VARIJABLE
    const [currentWordSet, setCurrentWordSet] = useState<string | null>(null);


    //KONTEKSTI
    const navigate = useNavigate();
    const { setSelectedWordSet } = useLearning();

    //FUNKCIJE

    //MODELI
    const WordSets = [
    { id: 'set1', name: 'Osnovni riječi', words: ['riječ1', 'riječ2', 'riječ3'] },
    { id: 'set2', name: 'Napredni riječi', words: ['riječ4', 'riječ5', 'riječ6'] },
    { id: 'set3', name: 'Stručni riječi', words: ['riječ7', 'riječ8', 'riječ9'] },
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
                <div className="flex w-full items-start justify-start mb-8">
                <div className="bg-[var(--color-primary-extra-dark)] z-10 rounded-r-full py-6 px-16 text-on-primary font-space text-2xl font-semibold">Odaberite rječnik:</div>
              </div>

    {/* OPCIJE I GUMB */}
    <div className="w-full max-w-[600px] rounded-3xl  p-8 z-10 mx-5">
                        <div className="space-y-4">
                {WordSets.map(set => (
                    <button
                    key={set.id}
                    onClick={() => setCurrentWordSet(set.id)}
                    type="button"
        className={`
            w-full flex items-center gap-4 px-6 py-4 
            bg-white rounded-full shadow-md
            transition-all cursor-pointer
            ${currentWordSet === set.id 
                ? 'ring-4 ring-[var(--color-primary-dark)] ' 
                : 'hover:shadow-lg hover:scale-105'
            }
        `}
    >
        {/* Pink circle indicator */}
        <div className={`
            w-6 h-6 rounded-full border-2 
            ${currentWordSet === set.id 
                ? 'bg-[var(--color-primary-dark)] border-[var(--color-primary-dark)]' 
                : 'bg-white border-gray-300'
            }
        `} />
        
        {/* Label */}
        <span className="font-space text-[#8B6B7A]">
            {set.name}
        </span>
    </button>
                ))}
            </div>
            
            {/* Gumb za nastavak */}
            <button 
                disabled={!currentWordSet}
                onClick={() => {
                    if (!currentWordSet) return;
                    
                    const selected = WordSets.find(s => s.id === currentWordSet);
                    if (selected) {
                        setSelectedWordSet({
                            id: selected.id,
                            name: selected.name,
                            words: [] // TODO: dodati prave Word objekte
                        });
                    }
                    
                    navigate('/learningSession');
                }}
                className="mt-8 w-full py-4 bg-(--color-primary-dark) text-on-dark font-space rounded-full disabled:opacity-30"
            >
                Dalje
            </button>
        </div>
        
            </div>   
           
        </PageTransition>

        
    );
};


export default Home;