
import { useNavigate } from "react-router";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import { useState, useEffect } from "react";
import { useLearning } from "../context/LearningContext";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";
import { Mosaic } from "react-loading-indicators";

// Import types from LearningContext to avoid duplication
interface Word {
    id: number;
    SourceWord: string | null;
    SourcePhrases: string[];
    TargetWord: string;
    TargetPhrases: string[];
    AudioFile: string;
    Dictionaries: WordSet[] | null;
}

interface WordSet {
    id: number;
    name: string;
    language: string;
    words: Word[];
}

const Home = () => {
    //VARIJABLE
    const [currentWordSet, setCurrentWordSet] = useState<WordSet | null>(null);
    const [Loading, setLoading] = useState<boolean>(false);
    const [WordSets, setWordSets] = useState<WordSet[]>([]);

    //KONTEKSTI
    const navigate = useNavigate();
    const { setSelectedWordSet } = useLearning();

    //FUNKCIJE
    useEffect(() => {
        const fetchWordSets = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/api/v1/Dictionary');
                const data = response.data.dictionaries || [];
                setWordSets(data);
            } catch (error) {
                console.error('Error fetching word sets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWordSets();
    }, []);

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
                        <div className="flex w-full items-start justify-start mb-8">
                        <div className="bg-[var(--color-primary-extra-dark)] z-10 rounded-r-full py-6 px-16 text-on-primary font-space text-2xl font-semibold">Odaberite rječnik:</div>
                      </div>

            {/* OPCIJE I GUMB */}
            <div className="w-full max-w-[600px] rounded-3xl  p-8 z-10 mx-5">
                        <div className="space-y-4">
                {WordSets.map(set => (
                    <button
                    key={set.id}
                    onClick={() => setCurrentWordSet(set)}
                    type="button"
        className={`
            w-full flex items-center gap-4 px-6 py-4 
            bg-white rounded-full shadow-md
            transition-all cursor-pointer
            ${currentWordSet === set
                ? 'ring-4 ring-[var(--color-primary-dark)] ' 
                : 'hover:shadow-lg hover:scale-105'
            }
        `}
    >
        {/* Pink circle indicator */}
        <div className={`
            w-6 h-6 rounded-full border-2 
            ${currentWordSet === set
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
                    
                    // Spremamo odabrani WordSet u context
                    setSelectedWordSet(currentWordSet);
                    navigate('/chooseStyle');
                }}
                className="mt-8 w-full py-4 bg-(--color-primary-dark) text-on-dark font-space rounded-full disabled:opacity-30"
            >
                Dalje
            </button>
        </div>
                    </>
                )}
            </div>   
           
        </PageTransition>

        
    );
};


export default Home;