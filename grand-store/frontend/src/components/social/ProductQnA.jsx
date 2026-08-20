import React, { useState, useEffect } from 'react';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const ProductQnA = ({ questions = [], productId }) => {
  const [localQuestions, setLocalQuestions] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [newQuestion, setNewQuestion] = useState('');
  const [replyTexts, setReplyTexts] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!productId) return;
      try {
        const res = await axios.get(`${API_URL}/api/social-proof/questions/${productId}`);
        if (res.data.success) {
          setLocalQuestions(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch QnA:", error);
      }
    };
    fetchQuestions();
  }, [productId]);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getToken = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      return userInfo.token;
    } catch (e) {
      return null;
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !productId) return;
    
    setLoading(true);
    setErrorMsg('');
    try {
      const token = getToken();
      const res = await axios.post(
        `${API_URL}/api/social-proof/questions`,
        { productId, question: newQuestion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        setLocalQuestions(prev => [res.data.data, ...prev]);
        setNewQuestion('');
        setSuccessMsg("Your question has been posted.");
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (error) {
      console.error("Failed to post question:", error);
      setErrorMsg(error.response?.data?.error || "You must be logged in to ask a question.");
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e, qId) => {
    e.preventDefault();
    const replyText = replyTexts[qId];
    if (!replyText || !replyText.trim()) return;
    
    setErrorMsg('');
    try {
      const token = getToken();
      const res = await axios.post(
        `${API_URL}/api/social-proof/questions/${qId}/answers`,
        { text: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        setLocalQuestions(prev => prev.map(q => q._id === qId ? res.data.data : q));
        setReplyTexts(prev => ({ ...prev, [qId]: '' }));
        setSuccessMsg("Your answer has been posted.");
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (error) {
      console.error("Failed to post answer:", error);
      setErrorMsg(error.response?.data?.error || "You must be logged in to reply.");
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const getBadgeClass = (type) => {
    switch(type) {
      case 'expert': return 'bg-gold-500 text-black px-2 py-0.5 rounded text-[10px] uppercase font-bold ml-2 tracking-wider';
      case 'vendor': return 'bg-[#333] text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold ml-2 tracking-wider';
      case 'customer': return 'bg-white/10 text-[var(--color-ivory)] px-2 py-0.5 rounded text-[10px] uppercase font-bold ml-2 tracking-wider';
      default: return 'bg-white/10 px-2 py-0.5 rounded text-[10px] uppercase font-bold ml-2';
    }
  };

  return (
    <div className="product-qna">
      <h3 className="text-2xl font-serif mb-6 flex items-center gap-3">
        <MessageCircle className="text-gold-500" />
        Questions from Customers
      </h3>

      <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-sm relative">
        <h4 className="text-sm uppercase tracking-widest mb-4">Have a question about this product?</h4>
        <form onSubmit={handleAsk} className="flex gap-4">
          <input 
            type="text" 
            className="flex-1 bg-transparent border-b border-white/20 pb-2 focus:border-gold-500 outline-none transition-colors"
            placeholder="e.g. Is this wine sweet?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
          />
          <button type="submit" disabled={loading} className="button button-gold py-2 px-6 text-sm disabled:opacity-50">Ask</button>
        </form>
        {successMsg && (
          <div className="absolute -bottom-8 left-0 text-green-400 text-xs tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="absolute -bottom-8 left-0 text-red-400 text-xs tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            {errorMsg}
          </div>
        )}
      </div>

      {localQuestions.length === 0 ? (
        <p className="text-[var(--color-ivory-muted)] italic">No questions have been asked yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {localQuestions.map((q) => (
            <div key={q._id} className="border-b border-white/10 pb-4">
              <button 
                className="w-full text-left flex justify-between items-center py-2 group"
                onClick={() => toggleExpand(q._id)}
              >
                <span className="font-medium group-hover:text-gold-400 transition-colors">Q: {q.question}</span>
                {expanded[q._id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              
              {expanded[q._id] && q.answers && q.answers.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-gold-500/30 space-y-4 mb-4">
                  {q.answers.map((a, i) => (
                    <div key={i} className="text-sm">
                      <p className="text-[var(--color-ivory)] mb-1">
                        <span className="font-bold text-gold-400">A: </span> 
                        {a.text}
                      </p>
                      <p className="text-xs text-[var(--color-ivory-muted)] italic flex items-center">
                        Answered by {a.responder?.name || 'Grand Store User'} 
                        <span className={getBadgeClass(a.responderType)}>{a.responderType}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {expanded[q._id] && (!q.answers || q.answers.length === 0) && (
                <div className="mt-3 pl-4 border-l-2 border-gold-500/30 mb-4">
                  <p className="text-sm text-[var(--color-ivory-muted)] italic">Awaiting answer...</p>
                </div>
              )}
              
              {expanded[q._id] && (
                <form onSubmit={(e) => handleReply(e, q._id)} className="mt-4 flex gap-2 pl-4">
                  <input 
                    type="text" 
                    className="flex-1 bg-white/5 border border-white/10 px-3 py-1.5 text-sm focus:border-gold-500 outline-none transition-colors"
                    placeholder="Know the answer? Reply here..."
                    value={replyTexts[q._id] || ''}
                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [q._id]: e.target.value }))}
                  />
                  <button type="submit" className="button button-gold py-1.5 px-4 text-sm">Reply</button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductQnA;
