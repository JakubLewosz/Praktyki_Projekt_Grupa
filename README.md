### 👤 Rola 1: Użytkownik Podmiotu
Osoba reprezentująca instytucję nadzorowaną (np. bank).

| Wymaganie (Co chcę) | Cel (Po co) |
| :--- | :--- |
| Móc zalogować się do systemu za pomocą nazwy użytkownika (lub e-maila) i hasła. | Uzyskać dostęp do skrzynki odbiorczej i nadawczej. |
| Mieć możliwość odbierania wiadomości (wraz z załącznikami) wysłanych do mnie przez UKNF. | Zapoznać się z korespondencją od nadzorcy. |
| Mieć możliwość wysyłania wiadomości (wraz z załącznikami) **tylko do UKNF**. | Móc komunikować się z urzędem. |
| Widzieć wszystkie wiadomości pogrupowane w wątki (rozmowy). | Łatwo śledzić historię konwersacji. |
| Otrzymując wiadomość wysłaną do całej grupy (np. "Banki"), nie widzieć innych adresatów. | Zachować poufność korespondencji. |
| Móc odpowiedzieć na wiadomość grupową. | Moja odpowiedź trafi do indywidualnego wątku, widocznego tylko dla mnie i UKNF. |

---

### 👑 Rola 2: Użytkownik UKNF (Administrator)
Pracownik UKNF odpowiedzialny za zarządzanie systemem, bez dostępu do treści wiadomości.

| Wymaganie (Co chcę) | Cel (Po co) |
| :--- | :--- |
| Móc zalogować się do systemu. | Uzyskać dostęp do panelu administracyjnego. |
| Mieć możliwość tworzenia, edytowania i wyłączania kont użytkowników. | Zarządzać dostępem do systemu. |
| Podczas tworzenia użytkownika, móc określić jego typ (UKNF Admin, UKNF Merytoryczny, Podmiot). | Nadać mu odpowiednie uprawnienia. |
| Podczas tworzenia użytkownika typu "Podmiot", móc przypisać go do konkretnego podmiotu. | Poprawnie zidentyfikować użytkownika w systemie. |
| Mieć możliwość tworzenia, edytowania i wyłączania podmiotów (np. Bank X). | Zarządzać listą instytucji nadzorowanych. |
| Mieć możliwość tworzenia, edytowania i wyłączania grup (np. "Banki", "Domy Maklerskie"). | Kategoryzować podmioty. |
| Mieć możliwość dodawania i usuwania podmiotów z grup. | Zarządzać przynależnością podmiotów do grup. |
| **Nie mieć dostępu** do przeglądania treści wiadomości. | Zachować poufność komunikacji zgodnie z moją rolą. |

---

### 🕵️ Rola 3: Użytkownik UKNF (Merytoryczny)
Pracownik UKNF prowadzący korespondencję, przypisany do konkretnych grup podmiotów.

| Wymaganie (Co chcę) | Cel (Po co) |
| :--- | :--- |
| Móc zalogować się do systemu. | Uzyskać dostęp do skrzynki wiadomości. |
| Widzieć tylko te wątki i wiadomości, które dotyczą podmiotów z grup, do których jestem przypisany. | Mieć dostęp wyłącznie do relewantnej dla mnie korespondencji. |
| **Nie mieć dostępu** do funkcji administracyjnych (zarządzania użytkownikami, grupami, podmiotami). | Skupić się wyłącznie na pracy merytorycznej. |
| Mieć możliwość wysłania jednej wiadomości (z załącznikami) do całej grupy podmiotów. | Efektywnie komunikować się z wieloma podmiotami jednocześnie. |
| Aby wysyłka do grupy (np. 200 podmiotów) nie tworzyła 200 fizycznych kopii wiadomości i załącznika. | Nie obciążać niepotrzebnie systemu. |
| Aby każda odpowiedź od podmiotu na wiadomość grupową pojawiała się jako osobny, indywidualny wątek. | Móc prowadzić dalszą korespondencję z każdym podmiotem z osobna. |
| Aby każda konwersacja (wątek) była przypisana do grupy. | Zapewnić, że tylko uprawnieni użytkownicy merytoryczni (z tej samej grupy) będą mieli do niej dostęp. |
| (Opcjonalnie) Mieć możliwość tworzenia własnych, prywatnych list adresatów. | Ułatwić sobie wysyłanie wiadomości do często wybieranego podzbioru podmiotów. |
| Mieć możliwość wysłania wiadomości do jednej osoby | Efektywnie komunikować sie z podmiotem |
---

### ⚙️ Wymagania Ogólnosystemowe
To są większe bloki funkcjonalne, które obejmują wiele z powyższych historyjek:

* **System Uwierzytelniania:** Pełna obsługa logowania, ról i uprawnień.
* **Mechanizm Wiadomości:** Logika wysyłania, odbierania i wątkowania rozmów.
* **Obsługa Załączników:** Możliwość przesyłania wielu plików wraz z ustalonymi limitami (ilościowymi i rozmiaru).
* **Logika Wysyłki Grupowej:** Kluczowy mechanizm pozwalający na wysyłkę "jeden do wielu" z zachowaniem prywatności i optymalizacją zasobów.
* **Kontrola Dostępu (Grupy):** Ścisłe powiązanie dostępu do wątków z przynależnością użytkowników merytorycznych do grup.
