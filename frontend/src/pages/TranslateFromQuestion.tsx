import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { Mosaic } from "react-loading-indicators";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthProvider";

interface StartGameRequestDto {
    dictionaryId: string;
    userId: string;
}

interface WordDto {
    id: number;
    sourceWord: string;
    sourcePhrases: string[];
    targetWord: string;
    targetPhrases: string[];
}

interface StartGameResponseDto {
    sourceWord?: WordDto;
    answers?: WordDto[];
    //correctAnswerId?: number;
}

interface GameAnswerDto {
    UserId: number;
    QuestionWordId: number;
    ChosenWordId: number;
}

interface DisplayWord {
    id: number;
    displayWord: string;
    displayPhrases: string[];
}

interface Question {
    questionWord: DisplayWord;
    answerWords: DisplayWord[];
    correctAnswerId: number;
}

const Mode = {
    HRV: "hrv",
    ENG: "eng",
} as const;

// Stacked Cards Component for cycling through phrases
const StackedPhraseCards = ({ phrases, className = "" }: { phrases: string[], className?: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!phrases || phrases.length === 0) return null;

    const nextCard = () => {
        setCurrentIndex((prev) => (prev + 1) % phrases.length);
    };

    const prevCard = () => {
        setCurrentIndex((prev) => (prev - 1 + phrases.length) % phrases.length);
    };

    return (
        <div className={`relative ${className}`}>
            {/* Stacked cards effect - background cards */}
            {phrases.length > 1 && (
                <>
                    <div className="absolute top-2 left-1 right-1 h-full bg-[var(--color-primary-light)] rounded-lg opacity-60 -z-20" />
                    <div className="absolute top-1 left-0.5 right-0.5 h-full bg-[var(--color-primary)] rounded-lg opacity-40 -z-10" />
                </>
            )}
            
            {/* Main visible card */}
            <div className="bg-white border-2 border-[var(--color-primary-dark)] rounded-lg p-3 shadow-md min-h-[60px] flex items-center justify-center">
                <p className="font-space text-[#8B6B7A] text-sm text-center italic">
                    "{phrases[currentIndex]}"
                </p>
            </div>

            {/* Navigation arrows */}
            {phrases.length > 1 && (
                <div className="flex items-center justify-between mt-2">
                    <button 
                        onClick={prevCard}
                        className="w-7 h-7 rounded-full bg-[var(--color-primary-dark)] text-white font-bold flex items-center justify-center hover:bg-[var(--color-primary-extra-dark)] transition-all hover:cursor-pointer"
                    >
                        ‹
                    </button>
                    <span className="font-space text-xs text-[#8B6B7A]">
                        {currentIndex + 1} / {phrases.length}
                    </span>
                    <button 
                        onClick={nextCard}
                        className="w-7 h-7 rounded-full bg-[var(--color-primary-dark)] text-white font-bold flex items-center justify-center hover:bg-[var(--color-primary-extra-dark)] transition-all hover:cursor-pointer"
                    >
                        ›
                    </button>
                </div>
            )}
        </div>
    );
};

export const TranslateFromQuestion = () => {

    // VARIJABLE
    const navigate = useNavigate();

    // KONTEKSTI
    const [Loading, setLoading] = useState<boolean>(false);
    const { id } = useAuth();
    const { dictionaryId, mode } = useParams();
    const [question, setQuestion] = useState<Question | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<DisplayWord | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);

    // PROVJERE
    if (mode !== "hrv" && mode !== "eng") {
        navigate("/*");
        return;
    }

    if (id === null) {
        navigate("/login");
        return;
    }

    // FUNKCIJE
    const fetchNextQuestion = () => {
        console.log("Fetching question.");
        if (dictionaryId && id) {
            const query: StartGameRequestDto = {
                dictionaryId: dictionaryId,
                userId: id,
            }
            axiosInstance.get<StartGameResponseDto>("/api/v1/game/question", {
                params: query
            })
            .then((response) => {
                console.log("StartGameResponse:", response.data);
                if (response.data.sourceWord && response.data.answers) {
                    const correctAnswerId = response.data.answers?.find(
                    answ => answ.sourceWord === response.data.sourceWord?.sourceWord)?.id;
                    
                    console.log(correctAnswerId);
                    if (correctAnswerId !== undefined) {
                        if (mode === Mode.HRV) {
                            const question: Question = {
                                questionWord: {
                                    id: response.data.sourceWord.id,
                                    displayWord: response.data.sourceWord.sourceWord,
                                    displayPhrases: response.data.sourceWord.sourcePhrases,
                                },
                                answerWords: response.data.answers.map(answ => ({
                                    id: answ.id,
                                    displayWord: answ.targetWord,
                                    displayPhrases: answ.targetPhrases,
                                })),
                                correctAnswerId: correctAnswerId,
                            }
                            setQuestion(question);
                            console.log(question);    
                        }
                        else if (mode === Mode.ENG) {
                            const question: Question = {
                                questionWord: {
                                    id: response.data.sourceWord.id,
                                    displayWord: response.data.sourceWord.targetWord,
                                    displayPhrases: response.data.sourceWord.targetPhrases,
                                },
                                answerWords: response.data.answers.map(answ => ({
                                    id: answ.id,
                                    displayWord: answ.sourceWord,
                                    displayPhrases: answ.sourcePhrases,
                                })),
                                correctAnswerId: correctAnswerId,
                            }
                            setQuestion(question);
                            console.log(question); 
                        }
                    }
                }
                else {
                    console.log("Nema vise dostupnih");
                }
            })
            .catch((error) => {
                console.log("StartGameError:", error);
            })
        }
    };

    useEffect(() => {
        fetchNextQuestion();
    }, []);

    const handleQuestionAnswered = () => {
        console.log("Sending question");
        if (question !== null && selectedAnswer !== null) {
            setHasAnswered(true);
            const answerRequest: GameAnswerDto = {
                UserId: Number(id),
                QuestionWordId: question?.questionWord.id,
                ChosenWordId: selectedAnswer?.id,
            }
            console.log(answerRequest);
            axiosInstance.put("/api/v1/game/check-choice", undefined, {
                params: answerRequest    
            })
            .then(() => {

            })
            .catch(() => {

            });
        }
        console.log("Nije selected answer");
    };

    const handleNextQuestion = () => {
        setSelectedAnswer(null);
        setQuestion(null);
        setHasAnswered(false);
        fetchNextQuestion();
    }

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
                                <div className="z-10 w-[90vw] md:w-[70vw] lg:w-[60vw] min-h-[50vh] flex flex-col items-center justify-start mt-10 bg-white/80 rounded-lg shadow-lg backdrop-blur-lg border border-black min-w-[350px] max-w-[900px] p-6 overflow-y-auto">
                                    {/* Game content */}
                                    {question && question.questionWord && (
                                        <div className="w-full flex flex-col gap-6">
                                            {/* SOURCE SECTION */}
                                            <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b-2 border-[var(--color-primary-light)]">
                                                {/* Source Word - Left */}
                                                <div className="flex-1">
                                                    <p className="font-space text-xs text-[#8B6B7A] mb-1 uppercase tracking-wider">Riječ:</p>
                                                    <div className="bg-[var(--color-primary-dark)] rounded-lg px-6 py-4 shadow-md">
                                                        <h2 className="font-space text-xl md:text-2xl font-bold text-white">
                                                            {mode === Mode.HRV && question.questionWord.displayWord}
                                                        </h2>
                                                    </div>
                                                </div>

                                                {/* Source Phrases - Right (Stacked Cards) */}
                                                {question.questionWord.displayPhrases && question.questionWord.displayPhrases.length > 0 && (
                                                    <div className="flex-1 w-full md:w-auto">
                                                        <p className="font-space text-xs text-[#8B6B7A] mb-1 uppercase tracking-wider">Primjeri:</p>
                                                        <StackedPhraseCards phrases={question.questionWord.displayPhrases} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* TARGETS SECTION */}
                                            <div className="w-full">
                                                <p className="font-space text-xs text-[#8B6B7A] mb-3 uppercase tracking-wider">Odaberite prijevod:</p>
                                                <div className="flex flex-wrap justify-center gap-6">
                                                    {question.answerWords?.map((target) => {
                                                        const isCorrect = target.id === question.correctAnswerId;
                                                        const isSelected = selectedAnswer?.id === target.id;
                                                        const isWrongSelection = hasAnswered && isSelected && !isCorrect;
                                                        const showCorrect = hasAnswered && isCorrect;
                                                        
                                                        return (
                                                        <button
                                                            key={target.id}
                                                            onClick={() => {
                                                                if (!hasAnswered) {
                                                                    setSelectedAnswer(target);
                                                                }
                                                            }}
                                                            className={`
                                                                flex flex-col items-center p-4 rounded-xl shadow-md
                                                                transition-all duration-300 ease-in-out cursor-pointer min-w-[140px] max-w-[180px]
                                                                ${showCorrect
                                                                    ? 'ring-4 ring-[#66ff00] bg-[#66ff00]/20 scale-105'
                                                                    : isWrongSelection
                                                                        ? 'ring-4 ring-[#ff000d] bg-[#ff000d]/20 scale-105'
                                                                        : isSelected
                                                                            ? 'ring-4 ring-[var(--color-primary-extra-dark)] bg-[var(--color-primary-light)] scale-105' 
                                                                            : 'bg-white hover:shadow-lg hover:scale-102 border-2 border-transparent hover:border-[var(--color-primary)]'
                                                                }
                                                            `}
                                                        >
                                                            {/* Target Word */}
                                                            <div className={`
                                                                w-full rounded-lg px-4 py-3 transition-all duration-300 ease-in-out
                                                                ${hasAnswered && 'mb-3'}
                                                                ${showCorrect
                                                                    ? 'bg-[#66ff00]'
                                                                    : isWrongSelection
                                                                        ? 'bg-[#ff000d]'
                                                                        : isSelected
                                                                            ? 'bg-[var(--color-primary-extra-dark)]'
                                                                            : 'bg-[var(--color-primary-dark)]'
                                                                }
                                                            `}>
                                                                <p className="font-space text-base font-semibold text-white text-center">
                                                                    {target.displayWord}
                                                                </p>
                                                            </div>

                                                            {/* Target Phrases (Stacked Cards) - with smooth transition */}
                                                            <div className={`
                                                                w-full overflow-hidden transition-all duration-500 ease-in-out
                                                                ${hasAnswered && target.displayPhrases && target.displayPhrases.length > 0 
                                                                    ? 'max-h-[200px] opacity-100' 
                                                                    : 'max-h-0 opacity-0'}
                                                            `}>
                                                                {target.displayPhrases && target.displayPhrases.length > 0 && (
                                                                    <StackedPhraseCards
                                                                        phrases={target.displayPhrases}
                                                                        className="w-full"
                                                                    />
                                                                )}
                                                            </div>

                                                            {/* Selection indicator - with smooth transition */}
                                                            <div className={`
                                                                mt-3 w-5 h-5 rounded-full border-2 transition-all duration-300 ease-in-out
                                                                ${hasAnswered ? 'max-h-0 opacity-0 mt-0' : 'max-h-10 opacity-100'}
                                                                ${isSelected
                                                                    ? 'bg-[var(--color-primary-extra-dark)] border-[var(--color-primary-extra-dark)]' 
                                                                    : 'bg-white border-gray-300'
                                                                }
                                                            `} />
                                                        </button>
                                                    )})}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Game answer button - with smooth transition */}
                                <div className="relative h-[56px] mt-10 w-[320px] sm:w-[360px]">
                                    <button
                                        onClick={handleQuestionAnswered}
                                        type="button"
                                        disabled={selectedAnswer === null}
                                        className={`
                                            absolute inset-0 rounded-full font-space text-[18px] tracking-wide
                                            bg-(--color-primary-dark) text-on-dark shadow-lg
                                            hover:opacity-90 hover:shadow-xl hover:cursor-pointer
                                            disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed
                                            transition-all duration-300 ease-in-out
                                            ${hasAnswered ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'}
                                        `}
                                    >
                                        Odgovori
                                    </button>
                                    <button
                                        onClick={() => handleNextQuestion()}
                                        type="button"
                                        className={`
                                            absolute inset-0 rounded-full bg-(--color-primary-dark) 
                                            text-on-dark shadow-lg font-space text-[18px] tracking-wide 
                                            hover:opacity-90 hover:shadow-xl hover:cursor-pointer
                                            transition-all duration-300 ease-in-out
                                            ${hasAnswered ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none scale-95'}
                                        `}
                                    >
                                        Slijedeća riječ
                                    </button>
                                </div>
                            </div>

                            {/* Game bowls - Fixed at bottom - Hidden on mobile */}
                            <div className="hidden md:flex w-full h-32 items-end justify-center gap-4 z-10">
                                {/* Bowl 1 - Sad */}
                                <div className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all">
                                    <span className="font-space text-sm text-white">sad</span>
                                    <span className="font-space text-lg text-white font-bold mt-1"></span>
                                </div>

                                {/* Bowl 2 - Danas */}
                                <div className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all">
                                    <span className="font-space text-sm text-white">minuta</span>
                                    <span className="font-space text-lg text-white font-bold mt-1"></span>
                                </div>

                                {/* Bowl 3 - Sutra */}
                                <div className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all">
                                    <span className="font-space text-sm text-white">sat</span>
                                    <span className="font-space text-lg text-white font-bold mt-1"></span>
                                </div>

                                {/* Bowl 4 - Tjedan */}
                                <div className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all">
                                    <span className="font-space text-sm text-white">dan</span>
                                    <span className="font-space text-lg text-white font-bold mt-1"></span>
                                </div>

                                {/* Bowl 5 - Naučeno */}
                                <div className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all">
                                    <span className="font-space text-sm text-white">naučeno</span>
                                    <span className="font-space text-lg text-white font-bold mt-1"></span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </PageTransition>
    );

  
}

export default TranslateFromQuestion;