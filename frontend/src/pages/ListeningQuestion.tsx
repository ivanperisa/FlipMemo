import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Mosaic } from "react-loading-indicators";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import Header from "../components/Header";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useLearning } from "../context/LearningContext";

interface StartGameRequestDto {
  dictionaryId: string;
  userId: string;
}

interface ListeningAnswerDto {
  UserId: number;
  DictionaryId: number;
  WordId: number;
  Answer: string;
}

interface ListeningAnswerResponseDto {
  isCorrect: boolean;
  correctAnswer: string;
  box: number;
}

export const ListeningQuestion = () => {
  // VARIJABLE
  const [Loading, setLoading] = useState<boolean>(false);
  const [resultLoading, setResultLoading] = useState<boolean>(false);
  const [dictionaryIsEmpty, setDictionaryIsEmpty] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);

  // KONTEKSTI
  const navigate = useNavigate();
  const { id } = useAuth();
  const { dictionaryId, gameMode } = useLearning();

  // Listening states
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [wordId, setWordId] = useState<number | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [targetBowlIndex, setTargetBowlIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationTarget, setAnimationTarget] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [flyingWord, setFlyingWord] = useState<string | null>(null);
  const [flyingStartPos, setFlyingStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Refs for sounds and audio
  const audioRef = useRef<HTMLAudioElement>(null);
  const correctSoundRef = useRef<HTMLAudioElement>(null);
  const wrongSoundRef = useRef<HTMLAudioElement>(null);
  const answerInputRef = useRef<HTMLDivElement>(null);
  const bowlRefs = useRef<(HTMLDivElement | null)[]>([]);

  // PROVJERE
  if (gameMode !== "listening") {
    navigate("/*");
    return null;
  }

  if (id === null) {
    navigate("/login");
    return null;
  }

  const resetQuestionState = () => {
    setAnswer("");
    setHasAnswered(false);
    setIsCorrect(null);
    setCorrectAnswer(null);
    setTargetBowlIndex(null);
    setAnswerError(null);
    setIsAnimating(false);
    setAnimationTarget(null);
    setFlyingWord(null);
    setFlyingStartPos(null);
  };

  // FUNKCIJE
  const fetchNextQuestion = async () => {
    setLoading(true);
    setDictionaryIsEmpty(false);
    setFetchError(null);
    resetQuestionState();

    if (dictionaryId && id) {
      const query: StartGameRequestDto = {
        dictionaryId,
        userId: id,
      };

      try {
        const response = await axiosInstance.get<ArrayBuffer>(
          "/api/v1/game/listening/question",
          {
            params: query,
            responseType: "arraybuffer",
          }
        );

        const wordIdHeader = response.headers["x-word-id"];
        const parsedWordId = Number(wordIdHeader);

        if (!wordIdHeader || Number.isNaN(parsedWordId)) {
          throw new Error("Missing word id header.");
        }

        const blob = new Blob([response.data], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);

        setAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });

        setWordId(parsedWordId);
      } catch (error: any) {
        if (
          error.response?.status === 404 &&
          error.response?.data?.message?.startsWith(
            "No words available for listening review."
          )
        ) {
          setDictionaryIsEmpty(true);
        } else {
          setFetchError(
            error.response?.data?.message ||
              "Doslo je do greske pri ucitavanju pitanja. Pokusajte ponovno."
          );
        }
        console.log("ListeningQuestionError:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextQuestion();
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const playCorrect = () => {
    const audio = correctSoundRef.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play();
    }
  };

  const playWrong = () => {
    const audio = wrongSoundRef.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play();
    }
  };

  const handleQuestionAnswered = async () => {
    if (!wordId || !dictionaryId || !id) {
      setAnswerError("Nedostaju podaci za provjeru.");
      return;
    }

    if (!answer.trim()) {
      setAnswerError("Unesite odgovor prije provjere.");
      return;
    }

    setResultLoading(true);

    const answerRequest: ListeningAnswerDto = {
      UserId: Number(id),
      DictionaryId: Number(dictionaryId),
      WordId: wordId,
      Answer: answer,
    };

    try {
      const response = await axiosInstance.put<ListeningAnswerResponseDto>(
        "/api/v1/game/listening/check-answer",
        undefined,
        { params: answerRequest }
      );

      setIsCorrect(response.data.isCorrect);
      setCorrectAnswer(response.data.correctAnswer);
      setTargetBowlIndex(response.data.box);
      setHasAnswered(true);

      if (response.data.isCorrect) {
        playCorrect();
        const targetBowl = bowlRefs.current[response.data.box];
        const startElement = answerInputRef.current;
        if (targetBowl && startElement) {
          setTimeout(() => {
            const startRect = startElement.getBoundingClientRect();
            const bowlRect = targetBowl.getBoundingClientRect();

            setFlyingWord(response.data.correctAnswer);
            setFlyingStartPos({
              x: startRect.left + startRect.width / 2,
              y: startRect.top + startRect.height / 2,
            });
            setAnimationTarget({
              x: bowlRect.left + bowlRect.width / 2,
              y: bowlRect.top + bowlRect.height / 2,
            });
            setIsAnimating(true);
          }, 200);
        }
      } else {
        playWrong();
      }
    } catch (error: any) {
      setAnswerError(
        error.response?.data?.message || "Doslo je do greske pri slanju odgovora."
      );
      console.log("ListeningAnswerError:", error);
    } finally {
      setResultLoading(false);
    }
  };

  const handleNextQuestion = () => {
    fetchNextQuestion();
  };

  const replayAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play();
    }
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    setFlyingWord(null);
    setFlyingStartPos(null);
    setAnimationTarget(null);
    setTimeout(() => setTargetBowlIndex(null), 300);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-start w-screen">
        {/* Background Particles - always visible */}
        <div className="absolute z-0 w-screen h-screen">
          <Particles
            particleColors={["#ffffff", "#ffffff"]}
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
        <div className="h-[100vh] w-full flex flex-col items-center justify-between relative z-10 overflow-y-auto">
          {/* Header */}
          <Header />

          {Loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Mosaic
                color="var(--color-primary-dark)"
                size="medium"
                text=""
                textColor=""
              />
            </div>
          ) : (
            <>
              {dictionaryIsEmpty ? (
                <div className="flex flex-col items-center justify-center w-full flex-1 gap-6">
                  <div className="z-10 w-[90vw] md:w-[70vw] lg:w-[60vw] flex flex-col items-center justify-center gap-6 bg-white/80 rounded-lg shadow-lg backdrop-blur-lg border-2 border-[var(--color-primary-dark)] min-w-[350px] max-w-[900px] p-8">
                    <h2 className="font-space text-2xl font-bold text-[var(--color-primary-dark)] text-center">
                      Nema vise rijeci
                    </h2>
                    <p className="font-space text-base text-[#8B6B7A] text-center max-w-sm">
                      Izgleda da nemate vise rijeci za ovaj rijecnik. Vratite se
                      kasnije za nove izazove!
                    </p>
                    <div className="w-12 h-1 bg-[var(--color-primary)] rounded-full mt-2"></div>
                  </div>
                </div>
              ) : fetchError ? (
                <div className="flex flex-col items-center justify-center w-full flex-1 gap-6">
                  <div className="z-10 w-[90vw] md:w-[70vw] lg:w-[60vw] flex flex-col items-center justify-center gap-6 bg-white/80 rounded-lg shadow-lg backdrop-blur-lg border-2 border-[#dc2626] min-w-[350px] max-w-[900px] p-8">
                    <div className="w-16 h-16 rounded-full bg-[#fecaca] flex items-center justify-center">
                      <span className="text-3xl">!</span>
                    </div>
                    <h2 className="font-space text-2xl font-bold text-[#dc2626] text-center">
                      Greska
                    </h2>
                    <p className="font-space text-base text-[#dc2626] text-center max-w-sm">
                      {fetchError}
                    </p>
                    <button
                      onClick={() => fetchNextQuestion()}
                      className="mt-4 px-8 py-3 bg-[#dc2626] text-white font-space rounded-full hover:bg-[#b91c1c] transition-all hover:cursor-pointer shadow-md"
                    >
                      Pokusaj ponovno
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Main content - Game container */}
                  <div className="flex flex-col items-center justify-start w-full flex-1 z-10 pb-8">
                    {/* Game box */}
                    <div className="z-10 w-[90vw] md:w-[70vw] lg:w-[60vw] min-h-[50vh] flex flex-col items-center justify-start mt-0 bg-white/80 rounded-lg shadow-lg backdrop-blur-lg border border-black min-w-[350px] max-w-[900px] p-6">
                      <div className="w-full flex flex-col gap-6">
                        <div className="w-full flex flex-col items-center gap-4 pb-4 border-b-2 border-[var(--color-primary-light)]">
                          <div className="flex flex-col items-center justify-center gap-2 w-full max-w-[700px]">
                            <p className="font-space text-xs text-[#8B6B7A] uppercase tracking-wider w-full text-left">
                              POSLUSAJ RIJEČ:
                            </p>
                            
                            <div className="w-full rounded-2xl border-2 border-[var(--color-primary-dark)] bg-white px-5 py-4 shadow-md overflow-hidden">
                              <audio
                                ref={audioRef}
                                controls
                                src={audioUrl || undefined}
                                className="w-full max-w-[620px] h-14 scale-110 origin-center mx-auto"
                              />
                            </div>
                          </div>
                          <button
                            onClick={replayAudio}
                            type="button"
                            className="px-4 py-2 rounded-full bg-[var(--color-primary-dark)] text-white font-space text-sm tracking-wide hover:opacity-90 hover:cursor-pointer transition-all"
                          >
                            Pusti ponovno
                          </button>
                        </div>

                        <div className="w-full flex flex-col gap-3" ref={answerInputRef}>
                          <p className="font-space text-xs text-[#8B6B7A] uppercase tracking-wider">
                            Unesi riječ:
                          </p>
                          <input
                            type="text"
                            value={answer}
                            onChange={(event) => setAnswer(event.target.value)}
                            disabled={hasAnswered}
                            className="w-full rounded-lg border-2 border-[var(--color-primary-light)] px-4 py-3 font-space text-base text-[#8B6B7A] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-dark)] disabled:bg-gray-100"
                          />
                        </div>

                        {hasAnswered && (
                          <div
                            className={`w-full rounded-lg border-2 px-4 py-3 font-space text-sm ${
                              isCorrect
                                ? "border-[#66ff00] bg-[#66ff00]/20 text-[#166534]"
                                : "border-[#dc2626] bg-[#fee2e2] text-[#991b1b]"
                            }`}
                          >
                            <p className="font-space text-sm">
                              {isCorrect ? "Tocno!" : "Netocno."}
                            </p>
                            {correctAnswer && (
                              <p className="font-space text-sm mt-1">
                                Tocan odgovor:{" "}
                                <span className="font-semibold">
                                  {correctAnswer}
                                </span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Game answer button - with smooth transition */}
                    <div className="relative mt-10 w-[320px] sm:w-[360px] flex flex-col items-center">
                      {answerError && (
                        <div className="flex flex-col items-center gap-3 mb-4">
                          <div className="bg-[#fef2f2] border-2 border-[#dc2626] rounded-lg px-4 py-3 shadow-md">
                            <p className="font-space text-sm text-[#dc2626] text-center">
                              {answerError}
                            </p>
                          </div>
                          <button
                            onClick={() => setAnswerError(null)}
                            type="button"
                            className="rounded-full bg-[#dc2626] text-white font-space text-[16px] tracking-wide px-6 py-3 hover:bg-[#b91c1c] hover:cursor-pointer transition-all shadow-md"
                          >
                            Pokusaj ponovno
                          </button>
                        </div>
                      )}

                      <div
                        className={`h-[56px] flex items-center justify-center transition-all duration-300 ease-in-out ${
                          !resultLoading
                            ? "opacity-0 pointer-events-none scale-95 absolute"
                            : "opacity-100 scale-100"
                        }`}
                      >
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
                        disabled={hasAnswered || !answer.trim()}
                        className={`
                          h-[56px] w-full rounded-full font-space text-[18px] tracking-wide
                          bg-[var(--color-primary-dark)] text-on-dark shadow-lg
                          hover:opacity-90 hover:shadow-xl hover:cursor-pointer
                          disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed
                          transition-transform duration-300 ease-in-out
                          ${
                            hasAnswered || resultLoading || answerError
                              ? "opacity-0 pointer-events-none scale-95 absolute"
                              : "opacity-100 scale-100"
                          }
                        `}
                      >
                        Odgovori
                      </button>

                      <button
                        onClick={handleNextQuestion}
                        type="button"
                        className={`
                          h-[56px] w-full rounded-full bg-[var(--color-primary-dark)]
                          text-on-dark shadow-lg font-space text-[18px] tracking-wide
                          hover:opacity-90 hover:shadow-xl hover:cursor-pointer
                          transition-all duration-300 ease-in-out
                          ${
                            hasAnswered && !resultLoading && !answerError
                              ? "opacity-100 scale-100"
                              : "opacity-0 pointer-events-none scale-95 absolute"
                          }
                        `}
                      >
                        Sljedeca rijec
                      </button>
                    </div>

                    <audio
                      ref={correctSoundRef}
                      src="/sounds/correct.mp3"
                      preload="auto"
                    />
                    <audio
                      ref={wrongSoundRef}
                      src="/sounds/wrong.mp3"
                      preload="auto"
                    />
                  </div>

                  {/* Game bowls - Fixed at bottom - Hidden on mobile */}
                  <div className="hidden md:flex w-full h-32 items-end justify-center gap-4 z-10">
                    <motion.div
                      ref={(el) => {
                        bowlRefs.current[0] = el;
                      }}
                      animate={{ scale: targetBowlIndex === 0 ? 1.5 : 1 }}
                      transition={{ duration: 0.3 }}
                      className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all"
                    >
                      <span className="font-space text-sm text-white">sad</span>
                      <span className="font-space text-lg text-white font-bold mt-1"></span>
                    </motion.div>

                    <motion.div
                      ref={(el) => {
                        bowlRefs.current[1] = el;
                      }}
                      animate={{ scale: targetBowlIndex === 1 ? 1.5 : 1 }}
                      transition={{ duration: 0.3 }}
                      className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all"
                    >
                      <span className="font-space text-sm text-white">
                        minuta
                      </span>
                      <span className="font-space text-lg text-white font-bold mt-1"></span>
                    </motion.div>

                    <motion.div
                      ref={(el) => {
                        bowlRefs.current[2] = el;
                      }}
                      animate={{ scale: targetBowlIndex === 2 ? 1.5 : 1 }}
                      transition={{ duration: 0.3 }}
                      className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all"
                    >
                      <span className="font-space text-sm text-white">sat</span>
                      <span className="font-space text-lg text-white font-bold mt-1"></span>
                    </motion.div>

                    <motion.div
                      ref={(el) => {
                        bowlRefs.current[3] = el;
                      }}
                      animate={{ scale: targetBowlIndex === 3 ? 1.5 : 1 }}
                      transition={{ duration: 0.3 }}
                      className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all"
                    >
                      <span className="font-space text-sm text-white">dan</span>
                      <span className="font-space text-lg text-white font-bold mt-1"></span>
                    </motion.div>

                    <motion.div
                      ref={(el) => {
                        bowlRefs.current[4] = el;
                      }}
                      animate={{ scale: targetBowlIndex === 4 ? 1.5 : 1 }}
                      transition={{ duration: 0.3 }}
                      className="w-28 h-28 bg-[var(--color-primary-dark)] rounded-t-3xl flex flex-col items-center justify-center shadow-lg hover:cursor-pointer hover:opacity-90 transition-all"
                    >
                      <span className="font-space text-sm text-white">
                        nauceno
                      </span>
                      <span className="font-space text-lg text-white font-bold mt-1"></span>
                    </motion.div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <AnimatePresence>
          {isAnimating && flyingStartPos && animationTarget && flyingWord && (
            <motion.div
              initial={{
                position: "fixed",
                left: flyingStartPos.x,
                top: flyingStartPos.y,
                x: "-50%",
                y: "-50%",
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
      </div>
    </PageTransition>
  );
};

export default ListeningQuestion;
