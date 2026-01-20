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
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [suggestedWords, setSuggestedWords] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [smallLoading, setSmallLoading] = useState(false);
  const [bigLoading, setBigLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [showDicts, setShowDicts] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedDihs, setSelectedDihs] = useState<number[]>([]);
  const [selectedSourceLanguage, setSelectedSourceLanguage] = useState("");
  type Dictionary = { id: number; name: string; language: string };
  const [dictArray, setDictArray] = useState<Dictionary[]>([]);

  useEffect(() => {
    if (showSuccessMessage) {
      const timeoutId = setTimeout(() => setShowSuccessMessage(false), 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [showSuccessMessage]);

  const onFinish = (values: { wordLanguage: string; word: string }) => {
    setSelectedSourceLanguage(form.getFieldValue('wordLanguage')?.toLowerCase());
    setSmallLoading(true);
    setShowErrorMessage(false);
    const params: Record<string, string> = {
      StartingLetters: values.word,
      Language: values.wordLanguage?.toLowerCase(),
    };

    axiosInstance
      .get("/api/v1/Word", { params })
      .then((response) => {
        setSuggestedWords(response.data.words);
        setShowSuggestions(true);
      })
      .catch((error) => {
        const searchError = error.response?.data?.message
          || (typeof error.response?.data === 'string' ? error.response.data : JSON.stringify(error.response?.data))
          || "Greška pri dodavanju riječi u rječnik!";
        setErrorMessage(searchError);
        setShowErrorMessage(true);
      })
      .finally(() => setSmallLoading(false));
  };

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    setBigLoading(true);
    axiosInstance
      .get("api/v1/Dictionary")
      .then((response) => {
        setDictArray(response.data.dictionaries);
        setShowDicts(true);
      })
      .catch(() => {
        setErrorMessage("Greška prilikom dohvaćanja rječnika.");
        setShowErrorMessage(true);
      })
      .finally(() => setBigLoading(false));
  };

  const handleAddWord = () => {
    setShowErrorMessage(false);
    setBigLoading(true);

    if (selectedDihs.length === 0) {  
        console.log(selectedDihs.length);  
        setErrorMessage("Molimo odaberite barem jedan rječnik.");
        return;
    }
    
    setShowDicts(false);
    form.resetFields();
    
    console.log(selectedWord, selectedSourceLanguage);
    const firstDict = dictArray.find(d => selectedDihs.includes(d.id));
    const dictLang = firstDict?.language?.toLowerCase();
    let targetLang: string;
    if (dictLang && selectedSourceLanguage && dictLang !== selectedSourceLanguage) {
      targetLang = dictLang;
    } else if (selectedSourceLanguage) {
      targetLang = selectedSourceLanguage === 'en' ? 'hr' : 'en';
    } else {
      targetLang = 'en';
    }

    const body = {
      dictionaryIds: selectedDihs,
      word: selectedWord,
      sourceLanguage: selectedSourceLanguage,
      targetLanguage: targetLang,
    };

    axiosInstance.post("/api/v1/Word", body)
    .then((response) => {
        setShowSuggestions(false);
        setSelectedDihs([]);
        setSuggestedWords([]);
        setSelectedWord(null);
        setSuccessMessage("Riječ uspješno dodana u rječnike!");
        setShowSuccessMessage(true);
        console.log(response);
    })
    .catch((error) => {
        setShowDicts(true);
        const errorMsg = error.response?.data?.message
                || (typeof error.response?.data === 'string' ? error.response.data : JSON.stringify(error.response?.data))
                || "Greška pri dodavanju riječi u rječnik!";
        setErrorMessage(errorMsg);
        setShowErrorMessage(true);
    })
    .finally(() => {
      setBigLoading(false);
    })
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

        <Header />

        <div className={`${showSuggestions ? 'mt-0' : 'mt-20'} w-full max-w-[400px] flex flex-col gap-4 relative overflow-hidden transition-all duration-500 ease-out
              ${(bigLoading || showDicts) && 'max-h-0'}
          `}
        >
          <div
              className={`
              overflow-hidden transition-all duration-500 ease-out
              ${(showErrorMessage && !showDicts) ? "max-h-40" : "max-h-0"}
              `}
          >
              <div className="flex flex-row items-center justify-between w-full bg-red-50 border-2 border-red-300 rounded-2xl p-3 z-10">
                <p className="font-space text-sm text-red-600 text-center">
                    {errorMessage}
                </p>
                <button
                    className="text-red-600" 
                    onClick={() => setShowErrorMessage(false)}
                >
                    <CloseCircleOutlined className="cursor-pointer" />
                </button>
              </div>
          </div>

          {showSuccessMessage && !showErrorMessage && (
              <div 
                  className="relative flex items-center justify-between w-full bg-green-50 border-2 border-green-300 rounded-2xl p-3 z-10 overflow-hidden"
              >
                  <p className="font-space text-sm text-green-600 text-center">
                      {successMessage}
                  </p>

                  <button
                      onClick={() => setShowSuccessMessage(false)}
                      className="text-green-600"
                  >
                      <CloseCircleOutlined className="cursor-pointer" />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-200">
                      <div className="h-full bg-green-500 animate-success-timer" />
                  </div>
              </div>
          )}

          <div className="w-full max-w-[400px] flex flex-col gap-4 relative">
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
                  <Select.Option value="en">Engleski</Select.Option>
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

              {!smallLoading && (
                <div className="flex flex-col items-center gap-4 mt-6">
                  <button
                    type="submit"
                    className="rounded-full bg-[var(--color-primary-dark)] w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-on-dark shadow-lg font-space text-[18px] tracking-wide hover:cursor-pointer z-1"
                  >
                    Pretraži riječ
                  </button>
                </div>
              )}
            </Form>

            {showSuggestions && !smallLoading &&(
              <div className="w-full bg-white/90 rounded-2xl shadow-md p-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-space text-lg text-[var(--color-primary-dark)]">
                    {suggestedWords.length > 0 ? 'Predlozene riječi' : 'Nema predloženih riječi'}
                  </h3>
                </div>
                <div className="flex flex-col gap-2">
                  {suggestedWords.map((word, index) => (
                    <div key={index} className="flex justify-between items-center bg-[var(--color-primary-light)] rounded-xl p-3 shadow-sm">
                      <span className="font-space text-[var(--color-text-on-primary)]">{word}</span>
                      <button
                        onClick={() => handleWordClick(word)}
                        className="cursor-pointer rounded-full bg-[var(--color-primary-dark)] text-white px-4 py-2 hover:opacity-90 transition-all font-space text-sm"
                      >
                        Dodaj riječ
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {smallLoading && (
              <div className="flex justify-center mt-6">
                <Mosaic
                  color="var(--color-primary-dark)"
                  size="medium"
                  text=""
                  textColor=""
                />
              </div>
            )}
          </div>
        </div>

        {showDicts && (
          <div className="w-full max-w-[600px] flex flex-col gap-4 relative overflow-hidden transition-all duration-500 ease-out">
            <h2
              className="font-bold text-[var(--color-text-on-primary)] font-space text-2xl text-center"
            >{`Dodajte riječ "${selectedWord}" u jedan ili više rječnika`}</h2>

            <div className="w-full bg-white/80 rounded-2xl shadow-md p-3 mt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="font-space text-sm text-[var(--color-primary-dark)]">Rječnici</span>
                <span className="font-space text-xs text-gray-500">Kliknite za odabir</span>
              </div>

              <div className="max-h-[320px] overflow-y-auto flex flex-col gap-2 pr-2">
                {dictArray.length === 0 && (
                  <div className="text-sm text-gray-500">Nema dostupnih rječnika</div>
                )}

                {dictArray.map((d) => {
                  const isSelected = selectedDihs.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      onClick={() => toggleSelectDict(d.id)}
                      className={`cursor-pointer w-full text-left flex items-center justify-between p-3 rounded-xl shadow-sm transition-all duration-200 transform hover:scale-[1.01] ${isSelected ? 'bg-[var(--color-primary-dark)] text-[var(--color-text-on-dark)]' : 'bg-[var(--color-primary-light)] text-[var(--color-text-on-primary)]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <BookOutlined style={{ color: 'var(--color-primary)', fontSize: 18 }} />
                        <span className="font-space font-medium">{d.name}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="border-2 rounded px-1 py-0.5 min-w-[32px] text-center">
                          <span className="font-inter italic not-italic md:italic text-sm tracking-wide">{d.language.toUpperCase()}</span>
                        </div>
                        {/* {isSelected && <CheckOutlined style={{ color: 'white' }} />} */}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
                className={`
                overflow-hidden transition-all duration-500 ease-out
                ${(showErrorMessage && showDicts) ? "max-h-40" : "max-h-0"}
                `}
            >
                <div className="flex flex-row items-center justify-between w-full bg-red-50 border-2 border-red-300 rounded-2xl p-3 z-10">
                <p className="font-space text-sm text-red-600 text-center">
                    {errorMessage}
                </p>
                <button
                    className="text-red-600" 
                    onClick={() => setShowErrorMessage(false)}
                >
                    <CloseCircleOutlined className="cursor-pointer" />
                </button>
                </div>
            </div>
            
            {/* Bottom button - now normal flow, not fixed */}
            <div className="w-full flex justify-center items-center">
              <button
                onClick={handleAddWord}
                className="cursor-pointer rounded-full px-8 py-3 bg-[var(--color-primary-dark)] text-[var(--color-text-on-dark)] shadow-xl font-space text-lg hover:opacity-95 transition-colors"
              >
                Dodaj riječ
              </button>
            </div>
          </div>
        )}

        {bigLoading && (
          <div className="scale-150 origin-center mt-20 flex items-center justify-center transition-all duration-300 ease-in-out">
              <Mosaic
                  color="var(--color-primary-dark)" 
                  size="large" 
                  text="" 
                  textColor="" 
              />
          </div>
        )}

      </div>
    </PageTransition>
  );
};

export default AdminAddWord;
