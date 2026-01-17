// ボールの箱を表示する関数
function displayBallBox(bottomCount, topCount) {
    const bottomRow = document.getElementById('bottomRow');
    const topRow = document.getElementById('topRow');
    
    // クリア
    bottomRow.innerHTML = '';
    topRow.innerHTML = '';
    
    // 下の段に5個のスロットを作成
    for (let i = 0; i < 5; i++) {
        const slot = document.createElement('div');
        if (i < bottomCount) {
            slot.className = 'ball';
        } else {
            slot.className = 'empty-slot';
        }
        bottomRow.appendChild(slot);
    }
    
    // 上の段に5個のスロットを作成
    for (let i = 0; i < 5; i++) {
        const slot = document.createElement('div');
        if (i < topCount) {
            slot.className = 'ball';
        } else {
            slot.className = 'empty-slot';
        }
        topRow.appendChild(slot);
    }
}

// 問題を生成する関数（1～10個のランダムな数のボール）
function generateQuestion() {
    let totalBalls;
    
    // 前回の答えと異なる答えを生成（続けて同じ答えにならないように）
    do {
        totalBalls = Math.floor(Math.random() * 10) + 1; // 1-10
    } while (totalBalls === lastAnswer);
    
    // 下段を優先的に埋める（最大5個）
    const bottomCount = Math.min(totalBalls, 5);
    // 残りを上段に配置
    const topCount = Math.max(0, totalBalls - 5);
    
    lastAnswer = totalBalls; // 今回の答えを記録
    
    return { bottomCount, topCount, answer: totalBalls };
}

// 現在の問題
let currentQuestion = null;
let correctCount = 0;
let totalCount = 0;
let answered = false;
let lastAnswer = null; // 前回の答えを記録
let questionCount = 0; // 問題数をカウント
const MAX_QUESTIONS = 10; // 最大問題数
let wrongQuestions = []; // 間違えた問題を記録
let isReviewMode = false; // 復習モードかどうか
let reviewQuestions = []; // 復習用の問題リスト
let reviewIndex = 0; // 復習問題のインデックス

// 道のマーカーを生成する関数
function createRoadMarkers() {
    const roadMarkers = document.getElementById('roadMarkers');
    roadMarkers.innerHTML = '';
    
    if (!isReviewMode) {
        // 通常モード: 10個のマーカー
        const trackWidth = document.getElementById('progressTrack').offsetWidth - 40;
        for (let i = 0; i < MAX_QUESTIONS; i++) {
            const marker = document.createElement('div');
            marker.className = 'road-marker';
            const position = 20 + (i / (MAX_QUESTIONS - 1)) * trackWidth;
            marker.style.left = `${position}px`;
            roadMarkers.appendChild(marker);
        }
    } else {
        // 復習モード: 復習問題数に応じたマーカー
        if (reviewQuestions.length > 0) {
            const trackWidth = document.getElementById('progressTrack').offsetWidth - 40;
            for (let i = 0; i < reviewQuestions.length; i++) {
                const marker = document.createElement('div');
                marker.className = 'road-marker';
                const divisor = reviewQuestions.length > 1 ? (reviewQuestions.length - 1) : 1;
                const position = 20 + (i / divisor) * trackWidth;
                marker.style.left = `${position}px`;
                roadMarkers.appendChild(marker);
            }
        }
    }
}

// 問題を表示する関数
function displayQuestion(question) {
    const feedback = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.number-button');
    const progressTrack = document.getElementById('progressTrack');
    
    // クリア
    feedback.className = 'feedback hidden';
    feedback.innerHTML = '';
    answered = false;
    
    // 道のマーカーを生成
    createRoadMarkers();
    
    // 犬の位置を更新
    const dog = document.getElementById('dog');
    
    if (!isReviewMode) {
        // 通常モード: 1問目が左端、10問目が右端
        const currentQuestion = questionCount + 1;
        const progress = (currentQuestion - 1) / (MAX_QUESTIONS - 1); // 0から1の間
        const trackWidth = progressTrack.offsetWidth - 40; // 左右のパディングを考慮
        const dogPosition = 20 + (progress * trackWidth); // 左端20pxから開始
        dog.style.left = `${dogPosition}px`;
        dog.style.display = 'block';
    } else {
        // 復習モード: 復習問題数に応じて位置を調整
        if (reviewQuestions.length > 0) {
            const currentQuestion = reviewIndex + 1;
            const divisor = reviewQuestions.length > 1 ? (reviewQuestions.length - 1) : 1;
            const progress = (currentQuestion - 1) / divisor; // 0から1の間
            const trackWidth = progressTrack.offsetWidth - 40;
            const dogPosition = 20 + (progress * trackWidth);
            dog.style.left = `${dogPosition}px`;
            dog.style.display = 'block';
        } else {
            dog.style.display = 'none';
        }
    }
    
    // ボタンの状態をリセット
    buttons.forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
    });
    
    // ボールの箱を表示
    displayBallBox(question.bottomCount, question.topCount);
    
    // 選択肢を生成
    generateOptions(question.answer);
}

// 選択肢を生成する関数（1～10の数字ボタン）
function generateOptions(correctAnswer) {
    const optionsContainer = document.getElementById('numberButtons');
    optionsContainer.innerHTML = '';
    
    // 1から10までの数字ボタンを作成
    for (let i = 1; i <= 10; i++) {
        const button = document.createElement('button');
        button.className = 'number-button';
        button.textContent = i;
        button.dataset.value = i;
        
        button.addEventListener('click', () => selectAnswer(i, correctAnswer));
        optionsContainer.appendChild(button);
    }
}

// 答えを選択する関数
function selectAnswer(selected, correct) {
    if (answered) return;
    
    answered = true;
    totalCount++;
    
    const feedback = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.number-button');
    
    // ボタンの状態をリセット
    buttons.forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
    });
    
    if (selected === correct) {
        // 正解
        correctCount++;
        feedback.innerHTML = '<div class="circle-mark"></div>';
        feedback.className = 'feedback correct';
        
        // 正解のボタンをハイライト
        buttons.forEach(btn => {
            if (parseInt(btn.dataset.value) === correct) {
                btn.classList.add('correct');
            }
        });
        
        // 音声フィードバック
        playSuccessSound();
        
        // 2秒後に次の問題に自動移行
        setTimeout(() => {
            if (isReviewMode) {
                // 復習モードの場合
                reviewIndex++;
                if (reviewIndex >= reviewQuestions.length) {
                    showReviewCompletion();
                } else {
                    currentQuestion = reviewQuestions[reviewIndex];
                    displayQuestion(currentQuestion);
                }
            } else {
                // 通常モードの場合
                questionCount++;
                if (questionCount >= MAX_QUESTIONS) {
                    showCompletion();
                } else {
                    newQuestion();
                }
            }
        }, 2000);
    } else {
        // 不正解
        feedback.textContent = 'もう一度考えてみよう！';
        feedback.className = 'feedback incorrect';
        
        // 間違えた問題を記録
        if (!isReviewMode) {
            wrongQuestions.push({
                bottomCount: currentQuestion.bottomCount,
                topCount: currentQuestion.topCount,
                answer: correct
            });
        }
        
        // 選択したボタンを赤くする
        buttons.forEach(btn => {
            if (parseInt(btn.dataset.value) === selected) {
                btn.classList.add('incorrect');
            }
        });
        
        // 2秒後に正解を表示
        setTimeout(() => {
            feedback.textContent = `答えは ${correct} だよ！`;
            feedback.className = 'feedback show-answer';
            
            buttons.forEach(btn => {
                btn.classList.remove('incorrect');
                if (parseInt(btn.dataset.value) === correct) {
                    btn.classList.add('correct');
                }
            });
            
            // さらに2秒後に次の問題へ
            setTimeout(() => {
                if (isReviewMode) {
                    // 復習モードの場合
                    reviewIndex++;
                    if (reviewIndex >= reviewQuestions.length) {
                        showReviewCompletion();
                    } else {
                        currentQuestion = reviewQuestions[reviewIndex];
                        displayQuestion(currentQuestion);
                    }
                } else {
                    // 通常モードの場合
                    questionCount++;
                    if (questionCount >= MAX_QUESTIONS) {
                        showCompletion();
                    } else {
                        newQuestion();
                    }
                }
            }, 2000);
        }, 2000);
    }
    
    // スコアを更新
    updateScore();
}

// スコアを更新する関数
function updateScore() {
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('totalCount').textContent = totalCount;
}

// 新しい問題を生成する関数
function newQuestion() {
    if (questionCount >= MAX_QUESTIONS) {
        showCompletion();
        return;
    }
    currentQuestion = generateQuestion();
    displayQuestion(currentQuestion);
}

// 完了画面を表示する関数
function showCompletion() {
    const feedback = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.number-button');
    const ballBox = document.getElementById('ballBox');
    const completionScreen = document.getElementById('completionScreen');
    const completionMessage = document.getElementById('completionMessage');
    const questionSection = document.querySelector('.question-section');
    const answerSelector = document.querySelector('.answer-selector');
    const progressTrack = document.getElementById('progressTrack');
    
    // ボタンを無効化
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.5';
    });
    
    // 問題と選択肢を非表示
    questionSection.style.display = 'none';
    answerSelector.style.display = 'none';
    feedback.className = 'feedback hidden';
    
    // 犬をゴール位置に移動
    const dog = document.getElementById('dog');
    const trackWidth = progressTrack.offsetWidth - 40;
    dog.style.left = `${20 + trackWidth}px`;
    
    // 正解数に応じたメッセージを生成
    let encouragementMessage = '';
    if (correctCount === 10) {
        encouragementMessage = 'すごい、すごすぎる！';
    } else if (correctCount >= 7 && correctCount <= 9) {
        encouragementMessage = 'よくがんばったね！';
    } else if (correctCount >= 4 && correctCount <= 6) {
        encouragementMessage = 'いいぞ、この調子！';
    } else if (correctCount >= 1 && correctCount <= 3) {
        encouragementMessage = 'あきらめないで、ゆうちゃんならできる！';
    } else {
        encouragementMessage = 'もう一度チャレンジしよう！';
    }
    
    // 完了メッセージを表示
    completionMessage.innerHTML = `${correctCount} / ${totalCount}問正解！<br><span class="encouragement">${encouragementMessage}</span>`;
    completionScreen.style.display = 'block';
    
    // 復習ボタンの表示/非表示
    const reviewBtn = document.getElementById('reviewBtn');
    if (wrongQuestions.length > 0) {
        reviewBtn.style.display = 'block';
    } else {
        reviewBtn.style.display = 'none';
    }
}

// 復習テストを開始する関数
function startReview() {
    const completionScreen = document.getElementById('completionScreen');
    const questionSection = document.querySelector('.question-section');
    const answerSelector = document.querySelector('.answer-selector');
    const buttons = document.querySelectorAll('.number-button');
    const questionCounter = document.getElementById('questionCounter');
    
    // 復習モードに切り替え
    isReviewMode = true;
    reviewQuestions = [...wrongQuestions]; // 間違えた問題のコピーを作成
    reviewIndex = 0;
    correctCount = 0;
    totalCount = 0;
    
    // UIをリセット
    completionScreen.style.display = 'none';
    questionSection.style.display = 'block';
    answerSelector.style.display = 'block';
    
    // 犬をスタート位置に戻す
    const dog = document.getElementById('dog');
    dog.style.left = '20px';
    
    // ボタンを有効化
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
    });
    
    // 最初の復習問題を表示
    if (reviewQuestions.length > 0) {
        currentQuestion = reviewQuestions[0];
        displayQuestion(currentQuestion);
        updateScore();
    }
}

// 復習完了画面を表示する関数
function showReviewCompletion() {
    const feedback = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.number-button');
    const ballBox = document.getElementById('ballBox');
    const completionScreen = document.getElementById('completionScreen');
    const completionMessage = document.getElementById('completionMessage');
    const questionSection = document.querySelector('.question-section');
    const answerSelector = document.querySelector('.answer-selector');
    const progressTrack = document.getElementById('progressTrack');
    
    // ボタンを無効化
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.5';
    });
    
    // 問題と選択肢を非表示
    questionSection.style.display = 'none';
    answerSelector.style.display = 'none';
    feedback.className = 'feedback hidden';
    
    // 犬をゴール位置に移動
    const dog = document.getElementById('dog');
    if (reviewQuestions.length > 0) {
        const trackWidth = progressTrack.offsetWidth - 40;
        dog.style.left = `${20 + trackWidth}px`;
    }
    
    // 正解数に応じたメッセージを生成
    let encouragementMessage = '';
    if (correctCount === reviewQuestions.length) {
        encouragementMessage = 'すごい、すごすぎる！';
    } else if (correctCount >= Math.ceil(reviewQuestions.length * 0.7)) {
        encouragementMessage = 'よくがんばったね！';
    } else if (correctCount >= Math.ceil(reviewQuestions.length * 0.4)) {
        encouragementMessage = 'いいぞ、この調子！';
    } else {
        encouragementMessage = 'あきらめないで、ゆうちゃんならできる！';
    }
    
    // 復習完了メッセージを表示
    completionMessage.innerHTML = `復習完了！${correctCount} / ${totalCount}問正解！<br><span class="encouragement">${encouragementMessage}</span>`;
    completionScreen.style.display = 'block';
    
    // 復習ボタンを非表示
    const reviewBtn = document.getElementById('reviewBtn');
    reviewBtn.style.display = 'none';
}

// 答えを表示する関数
function showAnswer() {
    if (!currentQuestion || answered) return;
    
    answered = true;
    totalCount++;
    
    const feedback = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.number-button');
    
    feedback.textContent = `答えは ${currentQuestion.answer} だよ！`;
    feedback.className = 'feedback correct';
    
    // 正解のボタンをハイライト
    buttons.forEach(btn => {
        if (parseInt(btn.dataset.value) === currentQuestion.answer) {
            btn.classList.add('correct');
        }
    });
    
    updateScore();
}

// 成功音（シンプルなビープ音の代替）
function playSuccessSound() {
    // Web Audio APIを使用して簡単な音を再生
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        // 音声再生がサポートされていない場合は無視
    }
}

// イベントリスナー
document.getElementById('newQuestionBtn').addEventListener('click', newQuestion);
document.getElementById('showAnswerBtn').addEventListener('click', showAnswer);
document.getElementById('reviewBtn').addEventListener('click', startReview);

// 初期化
questionCount = 0;
correctCount = 0;
totalCount = 0;
lastAnswer = null;
wrongQuestions = [];
isReviewMode = false;
currentQuestion = generateQuestion();
displayQuestion(currentQuestion);
updateScore();

// 犬をスタート位置に設定
const dog = document.getElementById('dog');
if (dog) {
    dog.style.left = '20px';
}

// 道のマーカーを初期化
setTimeout(() => {
    createRoadMarkers();
}, 100);

// 道のマーカーを初期化
createRoadMarkers();
