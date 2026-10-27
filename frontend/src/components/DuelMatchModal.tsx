import React, { useState, useEffect } from 'react';
import { Gamepad2, Users, Trophy, Zap, ArrowRight, Check, X, Shield, Clock, Flame, Sparkles } from 'lucide-react';
import { api } from '../api';

interface WaitingPlayer {
  id: string;
  name: string;
  avatar: string;
  level: string;
  rating: number;
  winRate: string;
  status: string;
  topic: string;
}

export function DuelMatchModal({
  isOpen = true,
  onClose,
  initialTopic = 'Fruits & Food',
  onDuelWin
}: {
  isOpen?: boolean;
  onClose: () => void;
  initialTopic?: string;
  onDuelWin?: (earnedXp: number) => void;
}) {
  if (!isOpen) return null;
  const [topic, setTopic] = useState(initialTopic);
  const [topics, setTopics] = useState<string[]>(['Fruits & Food', 'Travel & Places', 'Daily Life', 'Character & Mind']);
  const [waitingPlayers, setWaitingPlayers] = useState<WaitingPlayer[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState<WaitingPlayer | null>(null);
  const [duelState, setDuelState] = useState<'lobby' | 'matching' | 'playing' | 'result'>('lobby');
  const [roomId, setRoomId] = useState<string>('');

  // Duel play state
  const [round, setRound] = useState(1);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [wordInput, setWordInput] = useState('');
  const [roundLogs, setRoundLogs] = useState<string[]>([]);
  const [timer, setTimer] = useState(30);

  // Fetch topics and waiting players
  useEffect(() => {
    if (isOpen) {
      api.getGameTopics()
        .then(t => {
          if (Array.isArray(t) && t.length > 0) setTopics(t.map(x => x.topic));
        })
        .catch(() => {});

      fetchPlayers(topic);
    }
  }, [isOpen, topic]);

  const fetchPlayers = async (selectedTopic: string) => {
    try {
      const res = await api.getWaitingPlayers(selectedTopic);
      if (Array.isArray(res)) setWaitingPlayers(res);
    } catch {
      setWaitingPlayers([
        { id: 'p-1', name: 'Jasur Aliyev', avatar: 'J', level: 'B1', rating: 1420, winRate: '84%', status: 'Kutmoqda', topic: selectedTopic },
        { id: 'p-2', name: 'Madina Karimova', avatar: 'M', level: 'A2', rating: 1280, winRate: '76%', status: 'Kutmoqda', topic: selectedTopic },
        { id: 'p-3', name: 'Malika Saidova', avatar: 'M', level: 'B2', rating: 1540, winRate: '91%', status: 'Kutmoqda', topic: selectedTopic },
        { id: 'p-4', name: 'Azizbek Umarov', avatar: 'A', level: 'A1', rating: 870, winRate: '68%', status: 'Kutmoqda', topic: selectedTopic }
      ]);
    }
  };

  // Timer countdown during active match
  useEffect(() => {
    if (duelState === 'playing' && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (duelState === 'playing' && timer === 0) {
      handleNextRound();
    }
  }, [duelState, timer]);

  const startChallenge = async (opponent: WaitingPlayer) => {
    setSelectedOpponent(opponent);
    setDuelState('matching');

    try {
      const res = await api.challengePlayer({
        challengedUserId: opponent.id || 'opponent-user',
        topic,
        opponentName: opponent.name
      });
      setRoomId(res.roomId || 'duel-live');
      setTimeout(() => {
        setDuelState('playing');
        setRound(1);
        setMyScore(0);
        setOpponentScore(0);
        setTimer(25);
        setRoundLogs([`Bellashuv boshlandi! 1-raund: '${topic}' mavzusida tezkor so‘z yozish.`]);
      }, 1500);
    } catch {
      setTimeout(() => {
        setDuelState('playing');
        setRound(1);
        setMyScore(0);
        setOpponentScore(0);
        setTimer(25);
        setRoundLogs([`Bellashuv boshlandi! 1-raund: '${topic}' mavzusida tezkor so‘z yozish.`]);
      }, 1200);
    }
  };

  const handleWordSubmit = async () => {
    if (!wordInput.trim()) return;
    const word = wordInput.trim();
    setWordInput('');

    try {
      const res = await api.submitDuelWord({ roomId, topic, word, round });
      if (res.valid) {
        setMyScore(s => s + res.myPoints);
        setOpponentScore(s => s + res.opponentPoints);
        setRoundLogs(logs => [
          `Siz: '${word.toUpperCase()}' (+${res.myPoints} XP)`,
          `${selectedOpponent?.name}: javob berdi (+${res.opponentPoints} XP)`,
          ...logs
        ]);
      } else {
        setOpponentScore(s => s + res.opponentPoints);
        setRoundLogs(logs => [
          `Siz: so‘z qabul qilinmadi (0 XP)`,
          `${selectedOpponent?.name}: javob berdi (+${res.opponentPoints} XP)`,
          ...logs
        ]);
      }
    } catch {
      setMyScore(s => s + 15);
      setOpponentScore(s => s + 10);
      setRoundLogs(logs => [
        `Siz: '${word.toUpperCase()}' (+15 XP)`,
        `${selectedOpponent?.name}: javob berdi (+10 XP)`,
        ...logs
      ]);
    }
  };

  const handleNextRound = () => {
    if (round < 3) {
      setRound(r => r + 1);
      setTimer(25);
      const nextModeDesc = round === 1 ? '2-raund: So‘z zanjiri (oxirgi harf bilan boshlanadigan so‘z)' : '3-raund: Rasm va xotira tezligi';
      setRoundLogs(logs => [nextModeDesc, ...logs]);
    } else {
      setDuelState('result');
      const won = myScore >= opponentScore;
      const earned = won ? 50 : 20;
      if (onDuelWin) onDuelWin(earned);
      api.submitGameScore({
        gameMode: '1v1 Duel',
        score: myScore + earned,
        topic,
        correctAnswers: 3
      }).catch(() => {});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        {duelState === 'lobby' && (
          <>
            <div className="modal-heading">
              <div>
                <span className="eyebrow"><Zap size={14} /> 1V1 SO‘Z BELLASHUVI</span>
                <h2>Jonli Raqib Bilan Bellashuv</h2>
                <p>Mavzuni tanlang va kutayotgan foydalanuvchilar orasidan raqibingizni o‘yinga taklif qiling.</p>
              </div>
              <button className="icon-btn" onClick={onClose}><X size={20} /></button>
            </div>

            <div style={{ margin: '15px 0' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>Mavzuni tanlang:</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {topics.map(t => (
                  <button
                    key={t}
                    className={`filter-chip ${topic === t ? 'selected' : ''}`}
                    onClick={() => { setTopic(t); fetchPlayers(t); }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <h3 style={{ fontSize: '13px', margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} /> '{topic}' mavzusida raqib kutayotganlar ({waitingPlayers.length} ta)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {waitingPlayers.map(p => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: 'var(--panel)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="avatar">{p.avatar}</div>
                    <div>
                      <strong style={{ fontSize: '13px', display: 'block' }}>{p.name}</strong>
                      <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                        Daraja: <b>{p.level}</b> · G‘alaba: {p.winRate} · Reyting: {p.rating} XP
                      </span>
                    </div>
                  </div>
                  <button className="primary-btn" style={{ padding: '8px 14px' }} onClick={() => startChallenge(p)}>
                    Taklif qilish <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {duelState === 'matching' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ animation: 'pulse 1s infinite', display: 'inline-block', marginBottom: '15px' }}>
              <Gamepad2 size={48} color="#7869f5" />
            </div>
            <h2>{selectedOpponent?.name} ga taklif yuborildi...</h2>
            <p style={{ color: 'var(--muted)', fontSize: '12px' }}>Raqib qabul qilmoqda, o‘yin boshlanmoqda...</p>
          </div>
        )}

        {duelState === 'playing' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div>
                <span className="eyebrow">RAUND {round} / 3</span>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Mavzu: {topic}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--soft)', color: 'var(--purple)', padding: '6px 12px', borderRadius: '8px', fontWeight: 800 }}>
                <Clock size={16} /> {timer}s
              </div>
            </div>

            {/* Live Scores */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '20px 0' }}>
              <div style={{ background: '#f0edff', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#6858e8', fontWeight: 700 }}>Sizning ballingiz</span>
                <h2 style={{ fontSize: '26px', margin: '6px 0 0', color: '#6858e8' }}>{myScore} XP</h2>
              </div>
              <div style={{ background: '#fff0e5', padding: '14px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#d58b52', fontWeight: 700 }}>{selectedOpponent?.name}</span>
                <h2 style={{ fontSize: '26px', margin: '6px 0 0', color: '#d58b52' }}>{opponentScore} XP</h2>
              </div>
            </div>

            {/* Input field */}
            <div className="game-input-row" style={{ margin: '15px 0' }}>
              <input
                value={wordInput}
                onChange={e => setWordInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleWordSubmit()}
                placeholder="Inglizcha so‘z kiriting va Enter bosing..."
                autoFocus
              />
              <button className="primary-btn" onClick={handleWordSubmit}>
                Yuborish <ArrowRight size={14} />
              </button>
            </div>

            {/* Round action logs */}
            <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '12px', maxHeight: '130px', overflowY: 'auto', fontSize: '11px' }}>
              {roundLogs.map((log, i) => (
                <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                  {log}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="outline-btn" onClick={handleNextRound}>
                {round < 3 ? 'Keyingi raundga o‘tish' : 'Natijalarni ko‘rish'} →
              </button>
            </div>
          </div>
        )}

        {duelState === 'result' && (
          <div style={{ textAlign: 'center', padding: '30px 15px' }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>
              {myScore >= opponentScore ? '🏆' : '🤝'}
            </div>
            <h2>{myScore >= opponentScore ? 'G‘alaba qozondingiz!' : 'Ajoyib bellashuv bo‘ldi!'}</h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
              Siz: <b>{myScore} XP</b> — {selectedOpponent?.name}: <b>{opponentScore} XP</b>
            </p>
            <div style={{ display: 'inline-block', background: '#e5f8f0', color: '#21996f', padding: '10px 18px', borderRadius: '10px', fontWeight: 800, margin: '15px 0' }}>
              +{myScore >= opponentScore ? 50 : 20} XP mukofot balingizga qo‘shildi!
            </div>
            <div>
              <button className="primary-btn" onClick={onClose} style={{ marginTop: '15px' }}>
                Yakunlash va chiqish <Check size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
