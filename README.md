# MonsterCardsPacker

**20260611 ver**

A simple browser-based tool for opening, analyzing, replacing images in, and repacking Monster Cards `.card` files. <br>
On a Windows PC, you can download this project from GitHub by clicking the green “Code” button in the upper-right corner, then selecting “Download ZIP.”<br>
브라우저에서 Monster Cards의 `.card` 파일을 열고, 분석하고, 이미지를 교체한 뒤 다시 패킹할 수 있는 간단한 도구입니다.<br>
Windows PC GitHub 기준 우측 상단의 초록색 "Code" 버튼을 눌러 Download ZIP 로 다운로드 할 수 있습니다.<br>

---

## Files / 파일 구성

| File              | English                                                   | 한국어                                |
| ----------------- | --------------------------------------------------------- | ---------------------------------- |
| `index.html`      | Main HTML structure                                       | 기본 HTML 구조                         |
| `styles.css`      | UI styles                                                 | UI 스타일                             |
| `app.js`          | Tool logic: ES3 decode/encode, image preview, ZIP, repack | ES3 디코드/인코드, 이미지 미리보기, ZIP, 재패킹 로직 |
| `translations.js` | Korean/English translation table                          | 한국어/영어 번역 테이블                      |

---

## How to Run / 사용 방법

1. Keep all four files in the same folder.
   네 개의 파일을 모두 같은 폴더에 넣어주세요.

2. Open `index.html` with the latest Chrome or Edge.
   최신 Chrome 또는 Edge로 `index.html`을 실행해주세요.

3. Select a `.card` file.
   `.card` 확장자를 가진 카드 파일을 선택해주세요.

4. Click **Open / Analyze Card**.
   **카드 열기 / 분석** 버튼을 눌러주세요.

5. Replace `image1Bytes`, `image2Bytes`, or `image3Bytes` if needed.
   필요한 경우 **이미지 파일 1 / 2 / 3**을 교체해주세요. PNG 사용을 권장합니다.

6. Click **Download new .card**.
   **새 .card 다운로드** 버튼을 눌러주세요.

---

## Password Extraction / 암호 추출

If the password used to unlock a `.card` file has been changed, you may need to select `ES3Defaults.asset` to extract the password.
`.card` 파일을 해제하는 비밀번호가 변경된 경우, `ES3Defaults.asset` 파일을 선택하여 암호를 추출해야 할 수 있습니다.

---

## Language Support / 언어 지원

Use the language selector in the upper-right corner.
우측 상단의 언어 선택 메뉴를 사용할 수 있습니다.

Currently supported languages:
현재 지원 언어:

* Korean / 한국어
* English / 영어

To add another language later, edit `translations.js` and add a new option in `index.html`.
다른 언어를 추가하려면 `translations.js`를 수정하고 `index.html`에 새 언어 옵션을 추가해주세요.

---

## Notes / 안내 및 주의사항

This tool processes files locally inside your browser. Files are not uploaded to any server.
이 도구는 브라우저 내부에서 파일을 로컬로 처리합니다. 파일은 어떤 서버에도 업로드되지 않습니다.

Always back up the original `.card` file before using a repacked result in the game.
재패킹한 결과물을 게임에서 사용하기 전에 원본 `.card` 파일을 반드시 백업해주세요.

This program is not an officially authorized tool.
이 프로그램은 공식적으로 허가된 도구가 아닙니다.

Please use it while following the rules and good manners when playing the game.
게임을 플레이할 때 룰과 매너를 지켜 사용해주세요.

Do not sell this program or use it for commercial or profit-making purposes.
이 프로그램 자체를 상업적으로 판매하거나 영리 목적으로 사용하지 말아주세요.

You are responsible for how you use this program.
프로그램 사용에 대한 책임은 사용자 본인에게 있습니다.

---

## Support the Developer / 개발자 후원

If possible, please consider purchasing the PLUS version below to support the game developer.
가능하다면 아래의 PLUS 버전을 구매하여 게임 제작자를 응원해주세요.

https://store.steampowered.com/app/3968530/MONSTER_CARDS__Plus_License/

---

Thank you.
감사합니다.
::: 
