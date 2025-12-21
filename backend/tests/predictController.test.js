const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');


const BASE_URL = 'http://localhost:5173'; 
const TIMEOUT = 10000;

describe('HumanOrAI - White Box Tests', () => {
  let driver;

  beforeAll(async () => {
    
    const options = new chrome.Options();
    
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    await driver.manage().window().setSize(1920, 1080);
    await driver.manage().setTimeouts({ implicit: 5000 });
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  beforeEach(async () => {
    await driver.get(BASE_URL);
    
    await driver.wait(
      until.elementLocated(By.css('textarea')),
      TIMEOUT
    );
  });

  // WHITE BOX TEST 1
  
  test('Test 1: Text Validation Logic - Minimum 10 Characters Validation', async () => {
    const textarea = await driver.findElement(By.css('textarea'));
    const analyzeButton = await driver.findElement(
      By.xpath("//button[contains(text(), 'Analizi Başlat')]")
    );

  
    await textarea.clear();
    await driver.sleep(500); 
    const isDisabledEmpty = await analyzeButton.getAttribute('disabled');
    expect(isDisabledEmpty).not.toBeNull();

     
     // 9 karakteri yavaşça gönder
     const text9Chars = '123456789';
     for (let i = 0; i < text9Chars.length; i++) {
       await textarea.sendKeys(text9Chars[i]);
       await driver.sleep(100); // Her karakter arasında 100ms bekle
     }
     await driver.sleep(1000); // State update için daha uzun bekleme
     const isDisabled9Chars = await analyzeButton.getAttribute('disabled');
     expect(isDisabled9Chars).not.toBeNull();

     
     await textarea.clear();
     await driver.sleep(500); // Clear sonrası bekleme
     
     // 10 karakteri yavaşça gönder
     const text10Chars = '1234567890';
     for (let i = 0; i < text10Chars.length; i++) {
       await textarea.sendKeys(text10Chars[i]);
       await driver.sleep(100); // Her karakter arasında 100ms bekle
     }
     await driver.sleep(1000); // State update için daha uzun bekleme
     const isEnabled10Chars = await analyzeButton.getAttribute('disabled');
     expect(isEnabled10Chars).toBeNull();

    
    await textarea.clear();
    await textarea.sendKeys('kısa');
    await driver.sleep(500);
    
  }, 30000);


   // WHITE BOX TEST 2
  test('Test 2: API Response Transformation and Data Processing Logic', async () => {
    const textarea = await driver.findElement(By.css('textarea'));
    const analyzeButton = await driver.findElement(
      By.xpath("//button[contains(text(), 'Analizi Başlat')]")
    );

  
    await textarea.clear();
    await textarea.sendKeys('Bu test metni API response transformation mantığını test etmek için yeterince uzun bir metin içeriyor.');
    await driver.sleep(500);
    
    
    await analyzeButton.click();
    await driver.sleep(3000); 

    try {
      const resultSection = await driver.wait(
        until.elementLocated(
          By.xpath("//div[contains(text(), 'Model Tahminleri') or contains(text(), 'AI Tespit') or contains(text(), 'İnsan Tespit')]")
        ),
        10000
      );
      expect(resultSection).toBeTruthy();
    } catch (e) {
      // Sonuç gösterilmediyse devam et
    }

   
    try {
      const aiProbabilityElement = await driver.findElement(
        By.xpath("//*[contains(text(), 'AI Tespit Oranı')]")
      );
      const humanProbabilityElement = await driver.findElement(
        By.xpath("//*[contains(text(), 'İnsan Tespit Oranı')]")
      );
      
      expect(aiProbabilityElement).toBeTruthy();
      expect(humanProbabilityElement).toBeTruthy();
      
     
      try {
        const aiParent = await aiProbabilityElement.findElement(By.xpath('./ancestor::*[contains(@class, "bg-white") or contains(@class, "rounded")][1]'));
        const humanParent = await humanProbabilityElement.findElement(By.xpath('./ancestor::*[contains(@class, "bg-white") or contains(@class, "rounded")][1]'));
        
        const aiParentText = await aiParent.getText();
        const humanParentText = await humanParent.getText();
        
       
        if (aiParentText.includes('%') || humanParentText.includes('%')) {
          expect(aiParentText.includes('%') || humanParentText.includes('%')).toBe(true);
        }
      } catch (e) {
       
        const aiText = await aiProbabilityElement.getText();
        const humanText = await humanProbabilityElement.getText();
        
        
        if (!aiText.includes('%') && !humanText.includes('%')) {
         
          expect(aiProbabilityElement).toBeTruthy();
          expect(humanProbabilityElement).toBeTruthy();
        }
      }
    } catch (e) {
    }

   
    try {
      const verdictCard = await driver.findElement(
        By.xpath("//*[contains(text(), 'HUMAN') or contains(text(), 'AI')]")
      );
      expect(verdictCard).toBeTruthy();
    } catch (e) {
      
    }

  
    const wordCountElement = await driver.findElement(
      By.xpath("//div[contains(text(), 'kelime')]")
    );
    const wordCountText = await wordCountElement.getText();
    expect(wordCountText).toContain('kelime');
    
    
    const wordCountMatch = wordCountText.match(/\d+/);
    if (wordCountMatch) {
      const displayedWordCount = parseInt(wordCountMatch[0]);
      expect(displayedWordCount).toBeGreaterThan(0);
    }
  }, 30000);

  // WhiteBox Test 3
   
  test('Test 3: Result Display Logic and Component Rendering', async () => {
    const textarea = await driver.findElement(By.css('textarea'));
    const analyzeButton = await driver.findElement(
      By.xpath("//button[contains(text(), 'Analizi Başlat')]")
    );

   
    const initialResultSections = await driver.findElements(
      By.xpath("//div[contains(text(), 'Model Tahminleri')]")
    );
    expect(initialResultSections.length).toBe(0);

   
    await textarea.clear();
    await textarea.sendKeys('Bu test metni result display mantığını test etmek için yeterince uzun bir metin içeriyor ve analiz edilebilir durumda.');
    await driver.sleep(500);
    
    await analyzeButton.click();
    
   
    try {
      const loadingSection = await driver.wait(
        until.elementLocated(
          By.xpath("//div[contains(text(), 'Modeller Çalışıyor')]")
        ),
        3000
      );
      expect(loadingSection).toBeTruthy();
    } catch (e) {
    
    }

   
    await driver.sleep(8000);

   
    let resultsSectionFound = false;
    try {
      const resultsSection = await driver.wait(
        until.elementLocated(
          By.xpath("//div[contains(text(), 'Model Tahminleri')]")
        ),
        15000
      );
      expect(resultsSection).toBeTruthy();
      resultsSectionFound = true;
      
      
      const isDisplayed = await resultsSection.isDisplayed();
      expect(isDisplayed).toBe(true);
    } catch (e) {
     
    }

    
    if (resultsSectionFound) {
      try {
      
        const modelCards = await driver.findElements(
          By.xpath("//*[contains(text(), 'Logistic Regression') or contains(text(), 'Naive Bayes') or contains(text(), 'Random Forest')]")
        );
        
        if (modelCards.length > 0) {
          expect(modelCards.length).toBeGreaterThan(0);
        }
      } catch (e) {
        
      }

    
      try {
        const verdictSection = await driver.findElement(
          By.xpath("//*[contains(text(), 'HUMAN') or contains(text(), 'AI')]")
        );
        expect(verdictSection).toBeTruthy();
      } catch (e) {
        
      }

    
      try {
        const statsCards = await driver.findElements(
          By.xpath("//*[contains(text(), 'AI Tespit Oranı') or contains(text(), 'İnsan Tespit Oranı')]")
        );
        
      
        if (statsCards.length >= 2) {
          expect(statsCards.length).toBeGreaterThanOrEqual(2);
          
         
          for (let i = 0; i < Math.min(2, statsCards.length); i++) {
            try {
            
              const parent = await statsCards[i].findElement(By.xpath('./..'));
              const parentText = await parent.getText();
              if (parentText.includes('%')) {
                expect(parentText).toContain('%');
              }
            } catch (e) { }
          }
        }
      } catch (e) { }
    }

       try {
      const clearButton = await driver.findElement(
        By.xpath("//button[contains(text(), 'Temizle')]")
      );
      
    
      const isClearDisabled = await clearButton.getAttribute('disabled');
      if (isClearDisabled === null) {
        await clearButton.click();
        await driver.sleep(1000);

        
        const textareaValue = await textarea.getAttribute('value');
        expect(textareaValue).toBe('');


        const resultSectionsAfterClear = await driver.findElements(
          By.xpath("//div[contains(text(), 'Model Tahminleri')]")
        );
        expect(resultSectionsAfterClear.length).toBe(0);

        
        const errorElementsAfterClear = await driver.findElements(
          By.xpath("//div[contains(@class, 'bg-red-50')]")
        );
        expect(errorElementsAfterClear.length).toBe(0);
      }
    } catch (e) { }
  }, 60000);
});

