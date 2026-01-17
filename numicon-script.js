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
    // 1～10のランダムな数を生成
    const totalBalls = Math.floor(Math.random() * 10) + 1; // 1-10
    
    // 下段を優先的に埋める（最大5個）
    const bottomCount = Math.min(totalBalls, 5);
    // 残りを上段に配置
    const topCount = Math.max(0, totalBalls - 5);
    
    return { bottomCount, topCount, answer: totalBalls };
}

// 現在の問題
let currentQuestion = null;
let correctCount = 0;
let totalCount = 0;
let answered = false;

// 問題を表示する関数
function displayQuestion(question) {
    const feedback = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.number-button');
    
    // クリア
    feedback.className = 'feedback hidden';
    answered = false;
    
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
        feedback.textContent = '正解！';
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
            newQuestion();
        }, 2000);
    } else {
        // 不正解
        feedback.textContent = 'もう一度考えてみよう！';
        feedback.className = 'feedback incorrect';
        
        // 選択したボタンを赤くする
        buttons.forEach(btn => {
            if (parseInt(btn.dataset.value) === selected) {
                btn.classList.add('incorrect');
            }
        });
        
        // 2秒後に正解を表示
        setTimeout(() => {
            feedback.textContent = `答えは ${correct} だよ！`;
            feedback.className = 'feedback correct';
            
            buttons.forEach(btn => {
                btn.classList.remove('incorrect');
                if (parseInt(btn.dataset.value) === correct) {
                    btn.classList.add('correct');
                }
            });
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
    currentQuestion = generateQuestion();
    displayQuestion(currentQuestion);
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

// 初期化
currentQuestion = generateQuestion();
displayQuestion(currentQuestion);
updateScore();
