# FlipMemo

## Opis projekta

**FlipMemo** je web aplikacija za učenje stranih jezika temeljena na principu **ponavljanja s odmakom (spaced repetition)**.  
Korisnik uči nove riječi kroz seriju pitanja i odgovora, pri čemu se riječi organiziraju u posude koje predstavljaju razine znanja.  
Točni odgovori pomiču riječ u sljedeću posudu, dok se netočni vraćaju na početak.  
Na taj način aplikacija potiče dugoročno pamćenje riječi kroz prilagođene vremenske intervale ponavljanja.

Sustav omogućava dva tipa korisnika:
- Administrator riječi  
- Učenik

## Funkcijski zahtjevi

### Korisnici
- **Učenik**:
  - Registrira se putem e-maila i prima inicijalnu lozinku koju **mora promijeniti pri prvom prijavljivanju**.  
  - Registracija i prijava koriste **OAuth 2.0** autentifikaciju.  
  - Može mijenjati lozinku i brisati vlastiti račun.

- **Administrator riječi**:
  - Ima najvišu razinu ovlasti u sustavu.  
  - Postoji **predefinirani root administrator** koji može kreirati nove administratore.  
  - Ostali administratori mogu upravljati rječnicima i riječima, ali **ne mogu kreirati root administratore**.


### Rječnici i riječi
- Rječnici grupiraju riječi **po jeziku** i imaju naziv.  
- Svaka riječ sadrži:
  - Englesku riječ  
  - Fraze i primjere upotrebe na engleskom
  - Hrvatski prijevod i fraze  
  - Glasovnu datoteku izgovora na engleskom
- Riječi se mogu dodavati, mijenjati i brisati.  
- Prilikom dodavanja nove riječi, administrator može dobiti **savjete iz vanjskog rječnika** putem **Thesaurus API-ja**.

### Proces učenja
- Učenik odabire rječnik i pokreće učenje prema trenutnom stanju učenja za taj rječnik.
- Modovi učenja:
  1. Engleska riječ → odabir hrvatskog prijevoda
  2. Hrvatska riječ → odabir engleskog prijevoda
  3. Izgovor engleske riječi → upis riječi (provjera točnosti pisanja)
  4. Tekstualna engleska riječ → snimanje vlastitog izgovora
- Netočni odgovori biraju se **nasumično iz skupa drugih riječi istog tipa u rječniku**.
- Točnost izgovora ocjenjuje se putem **vanjskog servisa** (ocjena 1–10).
- Točnost unosa teksta provjerava se **lokalno usporedbom s bazom**.
- **Spaced repetition logika**:
  - Riječi se organiziraju u posude s intervalima (1d, 2d, 4d, 8d, 15d, 30d).
  - Točan odgovor pomiče riječ u sljedeću posudu, netočan resetira riječ u prvu posudu.
  - Riječi koje prođu zadnju posudu i točno su odgovarane smatraju se **naučenima** i više se ne prezentiraju učeniku.

## Tehnologije

Projekt koristi moderne tehnologije kroz cijeli razvojni ciklus:

- **Frontend:** [React](https://react.dev/)
- **Backend:** [.NET (C#)](https://dotnet.microsoft.com/)
- **Baza podataka:** [PostgreSQL](https://www.postgresql.org/)
- **Vanjski rječnik API:** [Thesaurus API](https://rapidapi.com/collection/thesaurus-apis)
- **Autentikacija i autorizacija:** OAuth 2.0 + JWT tokeni za API pozive
- **Dizajn:** [Figma](https://www.figma.com/)  
- **Deploy:** [Render](https://render.com/) 

Dodatno:
- REST API komunikacija između frontenda i backenda  
- Entity Framework Core za pristup bazi podataka
- Mogućnost integracije servisa za ocjenjivanje izgovora

## Instalacija

## Članovi tima

- **Ivan Periša** – *Voditelj tima*
- Leon Lužaić
- Karlo Jularić
- Barbara Lešković
- Karim Krklec
- Martin Saraga
- Ivan Dundović

## Kontribucije

Svi prijedlozi i doprinosi su dobrodošli!

Ako želiš doprinijeti:
1. Forkaj repozitorij
2. Napravi novu granu: feature/nova-funkcionalnost
3. Pošalji pull request s opisom promjena
