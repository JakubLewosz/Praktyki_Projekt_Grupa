
# 📂 Struktura Projektu: Komunikator UKNF (Backend)

## 🌳 Katalog główny (backend)

* **Controllers/** (Kontrolery API - logika biznesowa i routing)
    * `AdminController.cs` (Zarządzanie użytkownikami, grupami, podmiotami. Wymaga roli AdminUKNF.)
    * `AttachmentsController.cs` (Obsługa przesyłania plików i zapis metadanych.)
    * `AuthController.cs` (Logowanie i generowanie tokenów JWT.)
    * `ThreadsController.cs` (Główna logika komunikacyjna: lista, szczegóły, tworzenie wątków i odpowiedzi.)
* **Data/** (Warstwa dostępu do danych)
    * `ApplicationDbContext.cs` (Kontekst bazy danych, dziedziczący z IdentityDbContext.)
    * `DataSeeder.cs` (Mechanizm inicjalizacji danych, np. tworzenie konta Admina.)
* **DTOs/** (Data Transfer Objects - modele do komunikacji z API)
    * `AssignGrupaToUserDto.cs`
    * `AssignPodmiotRequestDto.cs`
    * `AttachmentDto.cs`
    * `AuthorDto.cs`
    * `AuthResponseDto.cs`
    * `BroadcastMessageDto.cs`
    * `CreateGrupaRequestDto.cs`
    * `CreatePodmiotRequestDto.cs`
    * `CreateThreadDto.cs`
    * `CreateUserRequestDto.cs`
    * `LoginRequestDto.cs`
    * `MessageDto.cs`
    * `ThreadDetailsDto.cs`
    * `ThreadListDto.cs`
    * `UploadAttachmentResponseDto.cs`
* **Models/** (Modele encji bazy danych)
    * `ApplicationUser.cs` (Rozszerzenie IdentityUser o Role, PodmiotId i Grupy.)
    * `Podmiot.cs`
    * `Grupa.cs`
    * `Watek.cs`
    * `Wiadomosc.cs`
    * `Zalacznik.cs`
    * `RolaUzytkownika.cs` (Enum dla ról: AdminUKNF, MerytorycznyUKNF, Podmiot.)
* **Services/** (Logika biznesowa wyizolowana z kontrolerów, np. usługi wątków)
    * `ThreadService.cs` (Zawiera logikę obsługi załączników i odpowiedzi na Broadcast.)
* **Properties/**
    * `launchSettings.json` (Ustawienia uruchamiania aplikacji.)
* **uploads/** (Katalog generowany w czasie działania, do przechowywania fizycznych załączników)
    * `[pliki załączników...]`
* `appsettings.json` (Główne ustawienia konfiguracyjne, np. połączenie z DB, klucz JWT.)
* `Program.cs` (Punkt startowy aplikacji, konfiguracja middleware i usług.)
* `backend.csproj` (Plik projektu C# - definiuje zależności i frameworki.)

## 📐 Kluczowe Relacje (N:N)

* `Podmiot` <-> `Grupa`
* `ApplicationUser` (Merytoryczny) <-> `Grupa`
* `Wiadomosc` <-> `Zalacznik`

* # 🗺️ Graficzny Schemat Bazy Danych (ERD)

## Kluczowe Relacje Między Encjami

* **ApplicationUser** (Użytkownicy) 
    * Id (PK)
    * Rola
    * PodmiotId (FK)
* **Podmiot** (Instytucje zewnętrzne)
    * Id (PK)
    * Nazwa
    * IsActive
* **Grupa** (Kategorie tematyczne)
    * Id (PK)
    * Nazwa
* **Watek** (Główna konwersacja)
    * Id (PK)
    * Temat
    * GrupaId (FK)
* **Wiadomosc** (Posty w wątku)
    * Id (PK)
    * Tresc
    * WatekId (FK)
    * AutorId (FK)
* **Zalacznik** (Metadane plików)
    * Id (PK)
    * SciezkaPliku

---

## 🔗 Wizualizacja Relacji



### Opis Relacji (Krótkie Podsumowanie)

| Relacja | Typ | Opis |
| :--- | :--- | :--- |
| **Podmiot - ApplicationUser** | **1 do 0/1** | Jeden Podmiot może być powiązany z wieloma Użytkownikami typu `Podmiot`. |
| **Podmiot - Grupa** | **Wiele do Wielu** | Podmiot może należeć do wielu Grup (tabela pośrednia `GrupaPodmiot`). |
| **ApplicationUser - Grupa** | **Wiele do Wielu** | Użytkownik Merytoryczny UKNF może być przypisany do wielu Grup (tabela pośrednia `GrupaApplicationUser`). |
| **Watek - Grupa** | **1 do Wielu** | Jeden Wątek jest zawsze przypisany do jednej Grupy. |
| **Watek - Wiadomosc** | **1 do Wielu** | Jeden Wątek zawiera wiele Wiadomości. |
| **Wiadomosc - ApplicationUser**| **Wiele do 1** | Wiadomość ma jednego Autora. |
| **Wiadomosc - Zalacznik** | **Wiele do Wielu** | Wiadomość może mieć wiele Załączników (tabela pośrednia `WiadomoscZalacznik`). |

---
```mermaid
erDiagram
    %% ENCJIE GLOWNE
    ApplicationUser ||--o{ Podmiot : "jest_powiazany_z_jednym"
    ApplicationUser ||--o{ Wiadomosc : "jest_autorem"
    Podmiot ||--o{ Grupa : "N{posiada_przynaleznosc}M"
    Grupa ||--o{ Watek : "1{jest_kategoria}N"
    Watek ||--o{ Wiadomosc : "1{zawiera_posty}N"
    Wiadomosc ||--o{ ApplicationUser : "N{autor}1"
    Wiadomosc ||--o{ Zalacznik : "N{zawiera}M"
    Grupa ||--o{ ApplicationUser : "N{ma_dostep_do}M"
    
    %% DEFINICJA TABEL (Mermaid ERD wymaga definicji pól)
    ApplicationUser {
        string Id PK "PK z AspNet Identity"
        string UserName
        Rola Rola
        int PodmiotId FK "FK do Podmiot"
        DateTime LockoutEnd
    }
    
    Podmiot {
        int Id PK
        string Nazwa
        bool IsActive
    }

    Grupa {
        int Id PK
        string Nazwa
        bool IsActive
    }

    Watek {
        int Id PK
        string Temat
        int GrupaId FK
    }

    Wiadomosc {
        int Id PK
        string Tresc
        DateTime DataWyslania
        int WatekId FK
        string AutorId FK
    }

    Zalacznik {
        int Id PK
        string OryginalnaNazwa
        string SciezkaPliku
        string TypMIME
    }

    %% TABELE POSREDNIE (N:M)
    %% W Mermaid N:M (many-to-many) jest reprezentowane poprzez linie
    %% bez potrzeby jawnego definiowania tabel posrednich (GrupaPodmiot, GrupaApplicationUser, WiadomoscZalacznik)
'''
