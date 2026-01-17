import { useNavigate, useParams } from "react-router";
import { useEffect, useState, useRef } from "react";
import { Mosaic } from "react-loading-indicators";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

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
}

interface GameAnswerDto {
    UserId: number;
    DictionaryId: number;
    QuestionWordId: number;
    ChosenWordId: number;
}

interface GameAnswerResponseDto {
    isCorrect: boolean;
    box: number;
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
    const [dictionaryIsEmpty, setDictionaryIsEmpty] = useState(false);
    const [resultLoading, setResultLoading] = useState(false);

    // For scrolling
    const scrollRef = useRef<HTMLDivElement>(null);
    
    // Animation states
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationTarget, setAnimationTarget] = useState<{ x: number; y: number } | null>(null);
    const [flyingWord, setFlyingWord] = useState<string | null>(null);
    const [flyingStartPos, setFlyingStartPos] = useState<{ x: number; y: number } | null>(null);
    const [targetBowlIndex, setTargetBowlIndex] = useState<number | null>(null);
    
    // Refs for positions
    const answerRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
    const bowlRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Refs for sounds
    const correctSoundRef = useRef<HTMLAudioElement>(null);
    const wrongSoundRef = useRef<HTMLAudioElement>(null);

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
    const fetchNextQuestion = async () => {
        setLoading(true);
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
            })
            .catch((error) => {
                if (error.status === 404 
                    && error.response.data.message.startsWith("No words available")) {
                    setDictionaryIsEmpty(true);
                }
                console.log("StartGameError:", error);
            })
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNextQuestion();
    }, []);

    const handleQuestionAnswered = async () => {
        if (question !== null && selectedAnswer !== null) {
            setResultLoading(true);

            const answerRequest: GameAnswerDto = {
                UserId: Number(id),
                DictionaryId: Number(dictionaryId),
                QuestionWordId: question?.questionWord.id,
                ChosenWordId: selectedAnswer?.id,
            }
            console.log(answerRequest);


            try {
                const response = await axiosInstance.put<GameAnswerResponseDto>(
                    "/api/v1/game/check-choice", 
                    undefined, 
                    {params: answerRequest});

                    const bowlIndex = response.data.box;
                    setTargetBowlIndex(bowlIndex);
                    const isCorrect = selectedAnswer.id === question.correctAnswerId;
                    if (isCorrect) 
                        playCorrect();
                    else
                        playWrong();

                    setHasAnswered(true);
                
                    // Scroll to bottom first, then start animation
                    setTimeout(() => {
                        //window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                        if (scrollRef.current) {
                            console.log("Scrolling");
                            scrollRef.current.scrollTo({
                                top: scrollRef.current.scrollHeight,
                                behavior: 'smooth'
                            });
                        }
                    
                    // Wait for scroll to complete, then start animation
                    setTimeout(() => {
                        const correctAnswerId = question.correctAnswerId;
                        const correctAnswerElement = answerRefs.current.get(correctAnswerId);
                        const targetBowl = bowlRefs.current[bowlIndex];
                        
                        if (correctAnswerElement && targetBowl) {
                            const answerRect = correctAnswerElement.getBoundingClientRect();
                            const bowlRect = targetBowl.getBoundingClientRect();
                            
                            // Get the correct answer's word
                            const correctAnswer = question.answerWords.find(a => a.id === correctAnswerId);
                            if (correctAnswer) {
                                setFlyingWord(correctAnswer.displayWord);
                                setFlyingStartPos({
                                    x: answerRect.left + answerRect.width / 2,
                                    y: answerRect.top + answerRect.height / 2
                                });
                                setAnimationTarget({
                                    x: bowlRect.left + bowlRect.width / 2,
                                    y: bowlRect.top + bowlRect.height / 2
                                });
                                setIsAnimating(true);
                            }
                        }
                    }, 600);
                }, 300);

            } catch (error) {

            } finally {
                setResultLoading(false);
            }

        }
        console.log("Nije selected answer");
    };

    const handleAnimationComplete = () => {
        setIsAnimating(false);
        setFlyingWord(null);
        setFlyingStartPos(null);
        setAnimationTarget(null);
        // Keep targetBowlIndex until next question for the scale effect to linger briefly
        setTimeout(() => setTargetBowlIndex(null), 300);
    };

    const handleNextQuestion = () => {
        setSelectedAnswer(null);
        setQuestion(null);
        setHasAnswered(false);
        setIsAnimating(false);
        setAnimationTarget(null);
        setFlyingWord(null);
        setFlyingStartPos(null);
        setTargetBowlIndex(null);
        fetchNextQuestion();
    }

    const playCorrect = () => {
        const audio = correctSoundRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
    };

    const playWrong = () => {
        const audio = wrongSoundRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
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
                        <div ref={scrollRef} className="h-[100vh] w-full flex flex-col items-center justify-between relative z-10 overflow-y-auto">
                            {/* Header */}
                            <Header />
                            {/* <button onClick={() => playCorrect()}>
                                zvuk
                            </button> */}

                            {dictionaryIsEmpty ? (
                                <div className="flex flex-col items-center justify-center w-full flex-1 gap-6">
                                    <div className="z-10 w-[90vw] md:w-[70vw] lg:w-[60vw] flex flex-col items-center justify-center gap-6 bg-white/80 rounded-lg shadow-lg backdrop-blur-lg border-2 border-[var(--color-primary-dark)] min-w-[350px] max-w-[900px] p-8">
                                        {/* <div className="w-16 h-16 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                                            <span className="text-3xl">📚</span>
                                        </div> */}
                                        <h2 className="font-space text-2xl font-bold text-[var(--color-primary-dark)] text-center">
                                            Nema više riječi
                                        </h2>
                                        <p className="font-space text-base text-[#8B6B7A] text-center max-w-sm">
                                            Izgleda da nemate više riječi za ovaj riječnik. Vratite se kasnije za nove izazove!
                                        </p>
                                        <div className="w-12 h-1 bg-[var(--color-primary)] rounded-full mt-2"></div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Main content - Game container */}
                                    <div className="flex flex-col items-center justify-start w-full flex-1 z-10 pb-8">
                                        {/* Game box */}
                                        <div className="z-10 w-[90vw] md:w-[70vw] lg:w-[60vw] min-h-[50vh] flex flex-col items-center justify-start mt-0 bg-white/80 rounded-lg shadow-lg backdrop-blur-lg border border-black min-w-[350px] max-w-[900px] p-6">
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
                                                                    {question.questionWord.displayWord}
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
                                                                    ref={(el) => {
                                                                        if (el) answerRefs.current.set(target.id, el);
                                                                        else answerRefs.current.delete(target.id);
                                                                    }}
                                                                    onClick={() => {
                                                                        if (!hasAnswered) {
                                                                            setSelectedAnswer(target);
                                                                        }
                                                                    }}
                                                                    className={`
                                                                        flex flex-col items-center p-4 rounded-xl shadow-md
                                                                        transition-all duration-300 ease-in-out 
                                                                        ${!hasAnswered && 'cursor-pointer'} 
                                                                        min-w-[140px] max-w-[180px]
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
                                            <div className={`flex items-center justify-center
                                                transition-all duration-300 ease-in-out 
                                                ${!resultLoading ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'}`}>
                                                <Mosaic
                                                    color="var(--color-primary-dark)" 
                                                    size="small" 
                                                    text="" 
                                                    textColor="" 
                                                />
                                            </div>
                                            <button
                                                onClick={handleQuestionAnswered}
                                                type="button"
                                                disabled={selectedAnswer === null}
                                                className={`
                                                    absolute inset-0 rounded-full font-space text-[18px] tracking-wide
                                                    bg-(--color-primary-dark) text-on-dark shadow-lg
                                                    hover:opacity-90 hover:shadow-xl hover:cursor-pointer
                                                    disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed
                                                    transition-transform duration-300 ease-in-out
                                                    ${hasAnswered || resultLoading ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'}
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
                                                    ${(hasAnswered && !resultLoading) ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none scale-95'}
                                                `}
                                            >
                                                Slijedeća riječ
                                            </button>
                                        </div>
                                        <audio ref={correctSoundRef} src="/sounds/correct.mp3" preload="auto"></audio>
                                        <audio ref={wrongSoundRef} src="/sounds/wrong.mp3" preload="auto"></audio>
                                    </div>

                                    {/* Game bowls - Fixed at bottom - Hidden on mobile */}
                                    <div className="hidden md:flex w-full h-32 items-end justify-center gap-4 z-10">
                                        {/* Bowl 1 - Sad */}
                                        <motion.div
                                            ref={(el) => { bowlRefs.current[0] = el; }}
                                            animate={{ scale: targetBowlIndex === 0 ? 1.5 : 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all"
                                        >
                                            <span className="font-space text-sm text-white">sad</span>
                                            <span className="font-space text-lg text-white font-bold mt-1"></span>
                                        </motion.div>

                                        {/* Bowl 2 - Danas */}
                                        <motion.div
                                            ref={(el) => { bowlRefs.current[1] = el; }}
                                            animate={{ scale: targetBowlIndex === 1 ? 1.5 : 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all"
                                        >
                                            <span className="font-space text-sm text-white">minuta</span>
                                            <span className="font-space text-lg text-white font-bold mt-1"></span>
                                        </motion.div>

                                        {/* Bowl 3 - Sutra */}
                                        <motion.div
                                            ref={(el) => { bowlRefs.current[2] = el; }}
                                            animate={{ scale: targetBowlIndex === 2 ? 1.5 : 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all"
                                        >
                                            <span className="font-space text-sm text-white">sat</span>
                                            <span className="font-space text-lg text-white font-bold mt-1"></span>
                                        </motion.div>

                                        {/* Bowl 4 - Tjedan */}
                                        <motion.div
                                            ref={(el) => { bowlRefs.current[3] = el; }}
                                            animate={{ scale: targetBowlIndex === 3 ? 1.5 : 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all"
                                        >
                                            <span className="font-space text-sm text-white">dan</span>
                                            <span className="font-space text-lg text-white font-bold mt-1"></span>
                                        </motion.div>

                                        {/* Bowl 5 - Naučeno */}
                                        <motion.div
                                            ref={(el) => { bowlRefs.current[4] = el; }}
                                            animate={{ scale: targetBowlIndex === 4 ? 1.5 : 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all"
                                        >
                                            <span className="font-space text-sm text-white">naučeno</span>
                                            <span className="font-space text-lg text-white font-bold mt-1"></span>
                                        </motion.div>
                                    </div>

                                    {/* Flying animation element */}
                                    <AnimatePresence>
                                        {isAnimating && flyingStartPos && animationTarget && flyingWord && (
                                            <motion.div
                                                initial={{
                                                    position: 'fixed',
                                                    left: flyingStartPos.x,
                                                    top: flyingStartPos.y,
                                                    x: '-50%',
                                                    y: '-50%',
                                                    scale: 1,
                                                    opacity: 1,
                                                    zIndex: 100,
                                                }}
                                                animate={{
                                                    left: animationTarget.x,
                                                    top: animationTarget.y,
                                                    scale: [1, 1.2, 0.3],
                                                    opacity: [1, 1, 0],
                                                }}
                                                transition={{
                                                    duration: 0.8,
                                                    ease: [0.25, 0.46, 0.45, 0.94],
                                                }}
                                                onAnimationComplete={handleAnimationComplete}
                                                className="bg-[#66ff00] rounded-lg px-4 py-3 shadow-xl pointer-events-none"
                                            >
                                                <p className="font-space text-base font-semibold text-white text-center whitespace-nowrap">
                                                    {flyingWord}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}

                        </div>
                    </>
                )}
            </div>
        </PageTransition>
    );

  
}

export default TranslateFromQuestion;