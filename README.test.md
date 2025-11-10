# 🎯 DirectedFundraiser – Lokaler Spendentest mit SMS-Benachrichtigung
Dieses Projekt demonstriert den vollständigen Ablauf einer Spende über einen Solidity-Smart-Contract mit anschließender SMS-Benachrichtigung via Twilio. Es basiert auf Hardhat, ethers.js (v6), und einem Event-Listener mit Twilio-Integration.

## 🔧 Voraussetzungen
- Lokale Hardhat-Node (npx hardhat node)
- Deployter DirectedFundraiser-Contract
- Twilio Trial-Konto mit verifizierter Empfänger-Telefonnummer
- .env-Datei im Projekt-Root mit folgenden Einträgen:
```
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TOKEN=your_auth_token_here
TWILIO_FROM=your_twilio_sender_number_here
BENEFICIARY_PHONE=verified_real_world_mobile_number
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0xe7f1725e7734ce288f8367e1bb143e90bb3f0512
```

## 🗂️ Beteiligte Dateien und Module
📁 `contracts/DirectedFundraiser/DirectedFundraiser.sol`
- Typ: Solidity-Smart-Contract
- Funktion: Definiert donate()-Funktion und emit-t das DonationReceived-Event

📁 `contracts/DirectedFundraiser/scripts/donate_directedFundraiser.ts`
- Typ: Hardhat-Skript
- Funktion: Löst eine Spende aus mit Nachricht und ETH-Betrag `await contract.donate("Spende für Schule Schönwalde-Glien", { value: ethers.parseEther("0.01") })`

📁 `contracts/DirectedFundraiser/scripts/donation_listener4sms.ts`
- Typ: Event-Listener (TypeScript)
- Funktion: Lauscht auf DonationReceived via `ethers.Contract.on(...)`
→ Bei Event-Eingang wird `notifyBySms.ts` aufgerufen

📁 `contracts/DirectedFundraiser/scripts/notifyBySms.ts`
- Typ: Benachrichtigungsmodul
- Funktion: Versendet SMS über Twilio API
client.messages.create({ to, body, from });

📁 `.env`
- Typ: Konfigurationsdatei
- Funktion: Enthält alle sensiblen Parameter:
- Twilio SID, Token, Absendernummer
- Zielnummer (BENEFICIARY_PHONE)
- RPC-URL und Contract-Adresse

📁 `package.json`
- Typ: Projekt-Metadaten
- Funktion: Definiert den Skript-Alias listener:sms
```
"scripts": {
  "listener:sms": "ts-node contracts/DirectedFundraiser/scripts/donation_listener4sms.ts"
}
```


## 🔁 Ablaufsteuerung
- Listener starten
`npm run listener:sms`
→ Aktiviert donation_listener4sms.ts, wartet auf DonationReceived
- Spende auslösen
`npx hardhat run scripts/donate_directedFundraiser.ts --network localhost`
→ Ruft donate() auf, löst Event aus
- Event wird erkannt
→ Listener ruft notifyBySms.ts auf
- SMS wird versendet
→ Twilio API sendet Nachricht an BENEFICIARY_PHONE  


```
┌────────────────────────────┐
│  User (Spender)            │
│  via Hardhat Script        │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  DirectedFundraiser.sol    │
│  (Smart Contract)          │
│  emit DonationReceived     │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  donation_listener4sms.ts  │
│  ethers.Contract.on(...)   │
│  Event: DonationReceived   │
└────────────┬───────────────┘
             │
             ▼
┌─────────────────────────────┐
│  notifyBySms.ts             │
│  Twilio client.messages     │
│  .create({ to, body, from })│
└────────────┬────────────────┘
             │
             ▼
┌────────────────────────────┐
│  Twilio SMS Gateway        │
│  Trial Account             │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  Empfänger (verifiziert)   │
│  z. B. <MOBILE_NUMBER      │
└────────────────────────────┘
```

## 📡 Event-Listener starten
Der Event-Listener (donation_listener4sms.ts) wird gestartet, bevor eine Spende ausgelöst wird. Er lauscht auf das DonationReceived-Event des Smart Contracts und informiert bei erfolgreichem Eingang über Betrag und Absender. Anschließend wird eine SMS-Benachrichtigung an die konfigurierte Zielnummer versendet.

```
npm run listener:sms
```

Erwartete Konsolenausgabe:
```

> ethereum@1.0.0 listener:sms
> ts-node contracts/DirectedFundraiser/scripts/donation_listener4sms.ts

[dotenv@17.2.3] injecting env (8) from .env -- tip: 👥 sync secrets across teammates & machines: https://dotenvx.com/ops
✅ .env geladen von: D:\develop\DLT\Ethereum\.env
📡 SMS Listener gestartet – warte auf DonationReceived...
```

## 💸 Spende auslösen
Die Spende wird über ein Hardhat-Skript ausgelöst:
```
npx hardhat run scripts/donate_directedFundraiser.ts --network localhost
```

Das Skript ruft z. B. folgende Funktion auf:
```
await contract.donate("Spende für Schule Schönwalde-Glien", { value: ethers.parseEther("0.01") });
```

Ein Event-Listener-Skript registriert das DonationReceived-Event des Smart Contracts und reagiert darauf, sobald eine Spende eingeht.
In unserem Testfall erfolgt eine Konsolenausgabe:
```
💰 Neue Spende von 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266: 0.01 ETH
```
Zudem empfängt die angegebene Mobilfunknummer des Beneficiary eine SMS.

## ⚠️ Fehlerbehandlung
### ❌ Fehler: INVALID_ARGUMENT
Fehlermeldung:
```
TypeError: invalid string value (argument="str", value=10000000000000000, code=INVALID_ARGUMENT)
```

Ursache:
donate() erwartet einen string-Parameter. ETH darf nicht als erstes Argument übergeben werden.
Lösung:
```
donate("Nachricht", { value: ethers.parseEther("0.01") })
```


### ❌ Fehler: INSUFFICIENT_FUNDS
Fehlermeldung:
Sender doesn't have enough funds to send tx. The max upfront cost is: ... and the sender's balance is: 0.

Ursache:
Der verwendete Wallet hat kein Guthaben.
Lösung:
```
Verwende ethers.getSigners() statt new Wallet(...) – Hardhat stellt automatisch ETH bereit.
```

### ❌ Fehler: Twilio code 21608
Fehlermeldung:
```
RestException [Error]: The number +49175123XXXX is unverified. Trial accounts cannot send messages to unverified numbers; verify +49175123XXXX at twilio.com/user/account/phone-numbers/verified, or purchase a Twilio number to send messages to unverified numbers
```

Ursache:
Twilio Trial-Konten dürfen nur an verifizierte Telefonnummern SMS senden.
Lösung:
- Verifiziere die Zielnummer unter Twilio Verified Numbers
- Oder upgrade auf ein bezahltes Twilio-Konto und verwende eine eigene Twilio-Nummer


