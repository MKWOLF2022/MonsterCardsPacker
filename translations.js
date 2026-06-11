/*
  MONSTER CARDS GUI translations
  ------------------------------------------------------------
  Keep this file focused on language text only.
  To add another language later:
    1. Add a new language key, for example "ja".
    2. Copy the same translation keys from ko/en.
    3. Add an option in index.html's languageSelect.
*/
window.MONSTER_CARD_TRANSLATIONS = {
  ko: {
    app: {
      title: 'MonsterCardsPacker - 20260611',
      subtitle: '브라우저 안에서만 작동하는 단일 HTML 도구입니다. 카드 파일은 외부 서버로 업로드되지 않습니다. 룰과 매너를 지켜 듀얼하자! 이 프로그램을 상업적인 용도로 이용하지 말아주세요. 꼭 상대방을 배려하며 이용해주세요. @MKWOLF2022',
      notice: '<b>중요:</b> 원본 <code>.card</code> 파일은 반드시 백업하세요. 이 도구는 사용자가 제공한 ES3 설정 기준으로 만든 비공식 편집 도구입니다. 게임 업데이트로 저장 포맷이 바뀌면 수정이 필요할 수 있습니다. 지나친 사용은 게임의 재미를 저해할 수 있습니다. 꼭 배려를 하면서 사용해주세요. 게임 개발자의 요청시 비공개됩니다.',
    },
    language: {
      label: 'Language',
      ko: '한국어',
      en: 'English',
    },
    sections: {
      open: {
        title: '1. 파일 열기',
        description: '먼저 <code>ES3Defaults.asset</code>와 <code>.card</code> 파일을 선택한 뒤 “카드 열기/분석”을 누르세요.',
        passwordHelp: 'ES3Defaults.asset을 넣으면 <code>encryptionPassword</code>를 자동으로 읽습니다. 수동 입력값이 비어있지 않으면 이 값을 사용합니다.',
      },
      status: { title: '상태' },
      summary: {
        title: '2. 카드 정보',
        supportedStructure: '지원하는 구조',
        structureText: 'ES3 JSON format=0\nAES-CBC encryptionType=1\nGzip compressionType=1\nPBKDF2-HMAC-SHA1(password, salt=IV, iterations=100, key=16 bytes)\n.card 앞 16바이트 = IV\nimage1Bytes/image2Bytes/image3Bytes = base64 이미지 바이트',
      },
      images: {
        title: '3. 이미지 확인 / 교체',
        description: '카드가 열리면 <code>image1Bytes</code>, <code>image2Bytes</code>, <code>image3Bytes</code> 미리보기가 표시됩니다. 각 레이어에 새 이미지 파일(PNG 권장)을 넣고 repack할 수 있습니다. 투명도를 허용합니다.',
      },
      unpack: {
        title: '4. Unpack 다운로드',
        description: '현재 열린 카드의 <code>card.json</code>, 이미지 파일, <code>manifest.json</code>을 ZIP으로 저장합니다.',
      },
      repack: {
        title: '5. JSON 고급 편집 / Repack',
        description: '일반적으로 이미지만 바꾸면 됩니다. 카드 이름/수치까지 직접 바꾸려면 JSON을 수정한 뒤 repack하세요. JSON 구조를 망가뜨리면 게임에서 열리지 않을 수 있습니다.',
      },
    },
    fields: {
      defaults: 'ES3Defaults.asset',
      password: '비밀번호',
      cardFile: '카드 파일',
      jsonImport: 'card.json 불러오기',
    },
    buttons: {
      open: '카드 열기/분석',
      clear: '초기화',
      downloadZip: 'unpacked ZIP 다운로드',
      downloadJson: 'card.json만 다운로드',
      applyJson: 'JSON을 현재 카드에 적용',
      repack: '새 .card 다운로드',
      downloadImage: '이 이미지 다운로드',
    },
    placeholders: {
      jsonText: '카드를 열면 내부 ES3 JSON이 여기에 표시됩니다.',
    },
    summary: {
      statusLabel: '상태',
      notOpened: '아직 카드가 열리지 않았습니다.',
    },
    status: {
      idle: '대기 중입니다.',
      reset: '초기화했습니다.',
      opening: '카드를 여는 중입니다...',
      openSuccess: 'OK: 카드 열기 성공\n파일: {file}\nES3: encryptionType={encryptionType}, compressionType={compressionType}, format={format}\n이미지 필드: {imageCount}개',
      imageReplaced: '{key} 이미지를 교체했습니다. 이제 “새 .card 다운로드”를 누르면 됩니다.',
      jsonImported: 'card.json을 불러왔습니다. “JSON을 현재 카드에 적용”을 누르면 반영됩니다.',
      jsonApplied: 'JSON을 현재 카드에 적용했습니다.',
      zipSuccess: 'OK: unpacked ZIP 생성 완료\n파일 수: {count}',
      repackSuccess: 'OK: 새 .card 생성 완료\n검증: 방금 만든 파일을 다시 복호화/압축해제/JSON 파싱까지 성공했습니다.',
      compatibilityWarning: '브라우저 호환성 문제: {missing} 기능이 없습니다. 최신 Chrome 또는 Edge를 권장합니다.',
    },
    errors: {
      generic: 'ERROR: {message}',
      noCardFile: '.card 파일을 선택하세요.',
      unsupportedFormat: '현재 HTML 도구는 ES3 JSON format=0만 지원합니다. 감지된 format={format}',
      unsupportedEncryption: '지원하지 않는 encryptionType={type}',
      unsupportedCompression: '지원하지 않는 compressionType={type}',
      encryptedTooShort: '암호화된 .card 파일이 너무 짧습니다.',
      noDecompressionStream: '이 브라우저는 DecompressionStream(gzip)을 지원하지 않습니다. 최신 Chrome 또는 Edge를 사용하세요.',
      noCompressionStream: '이 브라우저는 CompressionStream(gzip)을 지원하지 않습니다. 최신 Chrome 또는 Edge를 사용하세요.',
      imageReplaceFailed: '이미지 교체 실패: {message}',
      jsonImportFailed: 'card.json 불러오기 실패: {message}',
      jsonParseFailed: 'JSON 파싱 실패: {message}',
      zipFailed: 'ZIP 생성 실패: {message}',
      repackFailed: 'repack 실패: {message}',
      noCardObject: '먼저 .card 파일을 열거나 card.json을 적용하세요.',
    },
    image: {
      noFields: 'image1Bytes/image2Bytes/image3Bytes 필드를 찾지 못했습니다.',
      previewAlt: '{key} preview',
    },
    manifest: {
      note: 'card.json is the full ES3 JSON. Edit image files and use the GUI to repack, or use the Python tool repack command.',
    },
  },

  en: {
    app: {
      title: 'MonsterCardsPacker - 20260611',
      subtitle: 'A browser-only GUI tool. Card files are processed locally and are not uploaded to any external server. Please follow the rules and good manners when playing. Do not use this program for commercial purposes. Always be respectful and considerate of others when using it. @MKWOLF2022',
      notice: '<b>Important:</b> Always back up the original <code>.card</code> file. This is an unofficial editing tool based on the ES3 settings you provide. If the game changes its save format in an update, this tool may need changes. Excessive use may reduce the fun of the game. Please use it responsibly and with consideration. This tool may be made private if requested by the game developer.',
    },
    language: {
      label: 'Language',
      ko: '한국어',
      en: 'English',
    },
    sections: {
      open: {
        title: '1. Open files',
        description: 'Select <code>ES3Defaults.asset</code> and a <code>.card</code> file, then click “Open / Analyze Card”.',
        passwordHelp: 'When you select ES3Defaults.asset, the tool reads <code>encryptionPassword</code> automatically. If the manual password field is not empty, that value is used.',
      },
      status: { title: 'Status' },
      summary: {
        title: '2. Card info',
        supportedStructure: 'Supported structure',
        structureText: 'ES3 JSON format=0\nAES-CBC encryptionType=1\nGzip compressionType=1\nPBKDF2-HMAC-SHA1(password, salt=IV, iterations=100, key=16 bytes)\nFirst 16 bytes of .card = IV\nimage1Bytes/image2Bytes/image3Bytes = base64 image bytes',
      },
      images: {
        title: '3. Preview / Replace images',
        description: 'After opening a card, previews for <code>image1Bytes</code>, <code>image2Bytes</code>, and <code>image3Bytes</code> are shown. You can insert new image files (PNG recommended) into each layer and repack them. Transparency is supported.',
      },
      unpack: {
        title: '4. Download unpacked files',
        description: 'Save the currently opened card as a ZIP containing <code>card.json</code>, image files, and <code>manifest.json</code>.',
      },
      repack: {
        title: '5. Advanced JSON edit / Repack',
        description: 'Usually, you only need to replace images. To change the card name or stats directly, edit the JSON and repack. If the JSON structure is broken, the game may not open the card.',
      },
    },
    fields: {
      defaults: 'ES3Defaults.asset',
      password: 'Password',
      cardFile: 'Card file',
      jsonImport: 'Import card.json',
    },
    buttons: {
      open: 'Open / Analyze Card',
      clear: 'Reset',
      downloadZip: 'Download unpacked ZIP',
      downloadJson: 'Download card.json only',
      applyJson: 'Apply JSON to current card',
      repack: 'Download new .card',
      downloadImage: 'Download this image',
    },
    placeholders: {
      jsonText: 'After you open a card, the internal ES3 JSON appears here.',
    },
    summary: {
      statusLabel: 'Status',
      notOpened: 'No card has been opened yet.',
    },
    status: {
      idle: 'Idle.',
      reset: 'Reset complete.',
      opening: 'Opening card...',
      openSuccess: 'OK: Card opened successfully\nFile: {file}\nES3: encryptionType={encryptionType}, compressionType={compressionType}, format={format}\nImage fields: {imageCount}',
      imageReplaced: 'Replaced {key}. Click “Download new .card” to save the repacked card.',
      jsonImported: 'Loaded card.json. Click “Apply JSON to current card” to apply it.',
      jsonApplied: 'Applied JSON to the current card.',
      zipSuccess: 'OK: unpacked ZIP created\nFile count: {count}',
      repackSuccess: 'OK: New .card created\nVerification: the generated file was successfully decrypted, decompressed, and parsed as JSON.',
      compatibilityWarning: 'Browser compatibility issue: missing {missing}. Latest Chrome or Edge is recommended.',
    },
    errors: {
      generic: 'ERROR: {message}',
      noCardFile: 'Select a .card file.',
      unsupportedFormat: 'This HTML tool only supports ES3 JSON format=0. Detected format={format}',
      unsupportedEncryption: 'Unsupported encryptionType={type}',
      unsupportedCompression: 'Unsupported compressionType={type}',
      encryptedTooShort: 'The encrypted .card file is too short.',
      noDecompressionStream: 'This browser does not support DecompressionStream(gzip). Use the latest Chrome or Edge.',
      noCompressionStream: 'This browser does not support CompressionStream(gzip). Use the latest Chrome or Edge.',
      imageReplaceFailed: 'Image replacement failed: {message}',
      jsonImportFailed: 'Failed to import card.json: {message}',
      jsonParseFailed: 'JSON parse failed: {message}',
      zipFailed: 'ZIP creation failed: {message}',
      repackFailed: 'Repack failed: {message}',
      noCardObject: 'Open a .card file or apply card.json first.',
    },
    image: {
      noFields: 'Could not find image1Bytes/image2Bytes/image3Bytes fields.',
      previewAlt: '{key} preview',
    },
    manifest: {
      note: 'card.json is the full ES3 JSON. Edit image files and use the GUI to repack, or use the Python tool repack command.',
    },
  },
};
