👤 Rola 1: Użytkownik Podmiotu
Osoba reprezentująca instytucję nadzorowaną (np. bank).

Jako: Użytkownik podmiotu,


Chcę: móc zalogować się do systemu za pomocą mojej nazwy użytkownika (lub e-maila) i hasła,

Aby: uzyskać dostęp do skrzynki odbiorczej i nadawczej.

Jako: Użytkownik podmiotu,


Chcę: mieć możliwość odbierania wiadomości (wraz z załącznikami) wysłanych do mnie przez UKNF,




Aby: zapoznać się z korespondencją od nadzorcy.

Jako: Użytkownik podmiotu,


Chcę: mieć możliwość wysyłania wiadomości (wraz z załącznikami) tylko do UKNF,


Aby: móc komunikować się z urzędem.

Jako: Użytkownik podmiotu,


Chcę: widzieć wszystkie wiadomości pogrupowane w wątki (rozmowy),

Aby: łatwo śledzić historię konwersacji.

Jako: Użytkownik podmiotu,


Chcę: otrzymując wiadomość wysłaną do całej grupy (np. "Banki"), nie widzieć innych adresatów tej wiadomości,

Aby: zachować poufność korespondencji.

Jako: Użytkownik podmiotu,

Chcę: móc odpowiedzieć na wiadomość grupową,


Aby: moja odpowiedź trafiła do indywidualnego wątku, widocznego tylko dla mnie i UKNF.

👑 Rola 2: Użytkownik UKNF (Administrator)
Pracownik UKNF odpowiedzialny za zarządzanie systemem, bez dostępu do treści wiadomości.

Jako: Administrator UKNF,


Chcę: móc zalogować się do systemu,

Aby: uzyskać dostęp do panelu administracyjnego.

Jako: Administrator UKNF,


Chcę: mieć możliwość tworzenia, edytowania i wyłączania kont użytkowników,

Aby: zarządzać dostępem do systemu.

Jako: Administrator UKNF,


Chcę: podczas tworzenia użytkownika, móc określić jego typ (UKNF Admin, UKNF Merytoryczny, Podmiot),

Aby: nadać mu odpowiednie uprawnienia.

Jako: Administrator UKNF,


Chcę: podczas tworzenia użytkownika typu "Podmiot", móc przypisać go do konkretnego podmiotu, który reprezentuje,

Aby: poprawnie zidentyfikować użytkownika w systemie.

Jako: Administrator UKNF,


Chcę: mieć możliwość tworzenia, edytowania i wyłączania podmiotów (np. Bank X),

Aby: zarządzać listą instytucji nadzorowanych.

Jako: Administrator UKNF,


Chcę: mieć możliwość tworzenia, edytowania i wyłączania grup (np. "Banki", "Domy Maklerskie"),


Aby: kategoryzować podmioty.

Jako: Administrator UKNF,


Chcę: mieć możliwość dodawania i usuwania podmiotów z grup,

Aby: zarządzać przynależnością podmiotów do grup.

Jako: Administrator UKNF,


Chcę: nie mieć dostępu do przeglądania treści wiadomości,

Aby: zachować poufność komunikacji zgodnie z moją rolą.

🕵️ Rola 3: Użytkownik UKNF (Merytoryczny)
Pracownik UKNF prowadzący korespondencję, przypisany do konkretnych grup podmiotów.

Jako: Użytkownik merytoryczny UKNF,


Chcę: móc zalogować się do systemu,

Aby: uzyskać dostęp do skrzynki wiadomości.

Jako: Użytkownik merytoryczny UKNF,


Chcę: widzieć tylko te wątki i wiadomości, które dotyczą podmiotów z grup, do których jestem przypisany (np. "Banki"),


Aby: mieć dostęp wyłącznie do relewantnej dla mnie korespondencji.

Jako: Użytkownik merytoryczny UKNF,


Chcę: nie mieć dostępu do funkcji administracyjnych (zarządzania użytkownikami, grupami, podmiotami),

Aby: skupić się wyłącznie na pracy merytorycznej.

Jako: Użytkownik merytoryczny UKNF,


Chcę: mieć możliwość wysłania jednej wiadomości (z załącznikami) do całej grupy podmiotów (np. do wszystkich "Banków"),

Aby: efektywnie komunikować się z wieloma podmiotami jednocześnie.

Jako: Użytkownik merytoryczny UKNF,


Chcę: aby wysyłka do grupy (np. 200 podmiotów) nie tworzyła 200 fizycznych kopii wiadomości i załącznika,

Aby: nie obciążać niepotrzebnie systemu.

Jako: Użytkownik merytoryczny UKNF,


Chcę: aby każda odpowiedź od podmiotu na moją wiadomość grupową pojawiała się jako osobny, indywidualny wątek,

Aby: móc prowadzić dalszą korespondencję z każdym podmiotem z osobna.

Jako: Użytkownik merytoryczny UKNF,


Chcę: aby każda konwersacja (wątek) była przypisana do grupy,



Aby: zapewnić, że tylko uprawnieni użytkownicy merytoryczni (z tej samej grupy) będą mieli do niej dostęp.

Jako (Opcjonalnie): Użytkownik merytoryczny UKNF,


Chcę: mieć możliwość tworzenia własnych, prywatnych list adresatów,


Aby: ułatwić sobie wysyłanie wiadomości do często wybieranego podzbioru podmiotów.

⚙️ Wymagania Ogólnosystemowe (Epiki)
To są większe bloki funkcjonalne, które obejmują wiele historyjek:


System Uwierzytelniania: Pełna obsługa logowania, ról i uprawnień.


Mechanizm Wiadomości: Logika wysyłania, odbierania i wątkowania rozmów.



Obsługa Załączników: Możliwość przesyłania wielu plików wraz z ustalonymi limitami (ilościowymi i rozmiaru).



Logika Wysyłki Grupowej: Kluczowy mechanizm pozwalający na wysyłkę "jeden do wielu" z zachowaniem prywatności i optymalizacją zasobów.



Kontrola Dostępu (Grupy): Ścisłe powiązanie dostępu do wątków z przynależnością użytkowników merytorycznych do grup.
