import { useEffect, useState } from "react";
import Header from "../components/Header";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import { Form, Input, Select } from "antd";
import { useForm } from "antd/es/form/Form";
import {
  BookOutlined,
  CloseCircleOutlined,
  TranslationOutlined,
} from "@ant-design/icons";
import axiosInstance from "../api/axiosInstance";
import { Mosaic } from "react-loading-indicators";

const AdminAddWord = () => {
  const [form] = useForm();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [suggestedWords, setSuggestedWords] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDictPopup, setShowDictPopup] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedDihs, setSelectedDihs] = useState<number[]>([]);
  type Dictionary = { id: number; name: string; language: string };
  const [dictArray, setDictArray] = useState<Dictionary[]>([]);

  useEffect(() => {
    if (successMessage) {
      const timeoutId = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [successMessage]);

  const onFinish = (values: { wordLanguage: string; word: string }) => {
    setLoading(true);
    axiosInstance
      .get("/api/v1/Word", { params: { StartingLetters: values.word } })
      .then((response) => {
        setSuggestedWords(response.data.words);
        setShowSuggestions(true);
      })
      .catch(() => setErrorMessage("Greška prilikom pretrage riječi."))
      .finally(() => setLoading(false));
  };

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    setLoading(true);
    axiosInstance
      .get("api/v1/Dictionary")
      .then((response) => {
        setDictArray(response.data.dictionaries);
        setShowDictPopup(true);
      })
      .catch(() => setErrorMessage("Greška prilikom dohvaćanja rječnika."))
      .finally(() => setLoading(false));
  };

  const handleClosePopup = () => {
    setShowSuggestions(false);
    setSuggestedWords([]);
  };

  const handleCloseDictPopup = () => {
    setErrorMessage("");
    setShowDictPopup(false);
    setSelectedDihs([]);
    setSelectedWord(null);
  };

  const handleAddWord = () => {
    if (selectedDihs.length === 0) {  
        console.log(selectedDihs.length);  
        setErrorMessage("Molimo odaberite barem jedan rječnik.");
        return;
    }
    
    handleClosePopup();
    const wordLanguage = form.getFieldValue('wordLanguage')?.toLowerCase();
    form.resetFields();
    
    console.log(selectedWord, wordLanguage);
    const targetLang = "hr";

    const body = { DictionaryIds: selectedDihs, Word: selectedWord, SourceLanguage: wordLanguage, TargetLanguage: targetLang };

    axiosInstance.post("/api/v1/Word", body)
    .then((response) => {
        console.log(response);
    })
    .catch((error) => {
        const errorMsg = error.response?.data?.message || error.response?.data || "Greška pri dodavanju riječi u rječnik!";
        setErrorMessage(errorMsg);
    })

    console.log("Word:", selectedWord, "Selected dictionaries:", selectedDihs);
    setShowDictPopup(false);
    setSelectedDihs([]);
    setSelectedWord(null);
  };

  const toggleSelectDict = (id: number) => {
    setSelectedDihs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-start w-screen">
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

        {errorMessage && (
            <div 
                className="w-fit fixed bg-red-50 border-2 border-red-300 rounded-2xl p-3 z-50 mt-20"
            >
                <p className="font-space text-sm text-red-600 text-center">
                    {errorMessage}
                </p>
            </div>
        )}

        <Header />

        <div className="mt-20 w-full max-w-[400px] flex flex-col gap-4 relative">
          <label className="z-1 font-space text-[var(--color-text-on-primary)] text-lg">
            Unesite jezik i zapis riječi
          </label>

          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
              name="wordLanguage"
              rules={[
                { required: true, message: "Molimo odaberite jezik rječi" },
              ]}
              style={{ marginBottom: "16px" }}
            >
              <Select
                size="large"
                placeholder="Odaberite jezik rječi"
                className="rounded-5xl shadow-md w-screen text-xl p-4 h-16"
                prefix={<TranslationOutlined 
                    className="text-l"
                    style={{ color: 'var(--color-primary)' }} />
                }
              >
                <Select.Option value="EN">Engleski</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="word"
              rules={[
                { required: true, message: "Molimo unesite zapis riječi!" },
              ]}
              style={{ marginBottom: "25px" }}
            >
              <Input
                size="large"
                placeholder="Zapis riječ"
                onChange={() => setErrorMessage("")}
                prefix={
                  <BookOutlined
                    className="text-l"
                    style={{ color: "var(--color-primary)" }}
                  />
                }
                className="rounded-5xl shadow-md w-screen text-xl p-4 h-16"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                }}
              />
            </Form.Item>

            <div className="flex flex-col items-center gap-4 mt-6">
              <button
                type="submit"
                className="rounded-full bg-[var(--color-primary-dark)] w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-on-dark shadow-lg font-space text-[18px] tracking-wide hover:cursor-pointer z-1"
              >
                Pretraži riječ
              </button>
            </div>
          </Form>

          {loading && (
            <div className="flex justify-center mt-6">
              <Mosaic
                color="var(--color-primary-dark)"
                size="medium"
                text=""
                textColor=""
              />
            </div>
          )}

          {/* Popup za pronađene riječi */}
          {showSuggestions && suggestedWords.length > 0 && (
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm border border-[var(--color-primary-light)] rounded-2xl shadow-xl p-4 z-50 w-[40%] min-w-[300px] min-h-[350px]">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold text-[var(--color-primary-dark)]">
                  Pronađene riječi
                </h3>
                <CloseCircleOutlined
                  onClick={handleClosePopup}
                  className="text-[var(--color-primary-light)] hover:text-[var(--color-primary-dark)] cursor-pointer text-xl"
                />
              </div>
              <ul className="h-fit space-y-2 max-h-60 overflow-y-auto pr-2">
                {suggestedWords.map((word, index) => (
                  <li
                    key={index}
                    onClick={() => handleWordClick(word)}
                    className="text-center px-3 py-2 rounded-xl hover:bg-[var(--color-primary-light)] hover:text-white cursor-pointer transition w-[100%]"
                  >
                    {word}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Popup za odabir rječnika */}
          {showDictPopup && (
            <>
              {/* Overlay */}
              <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"></div>

              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm border border-[var(--color-primary-light)] rounded-2xl shadow-xl p-6 z-50 w-[40%] min-w-[300px] min-h-[350px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[var(--color-primary-dark)]">
                    Odaberite rječnike za riječ:{" "}
                    <span className="text-[var(--color-primary)]">
                      {selectedWord}
                    </span>
                  </h3>
                  <CloseCircleOutlined
                    onClick={handleCloseDictPopup}
                    className="text-[var(--color-primary-light)] hover:text-[var(--color-primary-dark)] cursor-pointer text-xl"
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Mosaic
                      color="var(--color-primary-dark)"
                      size="medium"
                      text=""
                      textColor=""
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3 max-h-[260px] overflow-y-auto mb-4">
                    {dictArray.map((dict) => {
                      const isSelected = selectedDihs.includes(dict.id);
                      return (
                        <div
                          key={dict.id}
                          onClick={() => toggleSelectDict(dict.id)}
                          className={`cursor-pointer px-4 py-3 rounded-xl border-2 w-[100%] text-center font-space transition-all mr-2 ${
                            isSelected
                              ? "bg-[var(--color-primary-light)] text-white border-[var(--color-primary-dark)] shadow-md"
                              : "bg-white text-[var(--color-primary-dark)] border-[var(--color-primary-light)] hover:border-[var(--color-primary-dark)] hover:shadow-sm"
                          }`}
                        >
                          <p className="font-semibold">{dict.name}</p>
                          <p className="text-sm opacity-80">{dict.language}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-center mt-4">
                  <button
                    onClick={handleAddWord}
                    className="rounded-full bg-[var(--color-primary-dark)] px-8 py-3 transition-all hover:opacity-90 hover:shadow-xl text-on-dark shadow-lg font-space text-[16px] tracking-wide cursor-pointer"
                  >
                    Dodaj riječ
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminAddWord;
