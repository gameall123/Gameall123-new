import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Crown, 
  Medal, 
  Award, 
  Zap,
  Target,
  Gift,
  Lock,
  Unlock,
  TrendingUp,
  Users,
  ShoppingCart,
  MessageCircle,
  Heart,
  Clock,
  DollarSign,
  Package,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'shopping' | 'social' | 'engagement' | 'special';
  type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  icon: React.ReactNode;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  requirement: string;
  secret?: boolean;
}

interface UserLevel {
  level: number;
  currentXP: number;
  xpToNext: number;
  totalXP: number;
  title: string;
  perks: string[];
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  level: number;
  totalXP: number;
  achievements: number;
  points: number;
}

export default function AchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recentUnlocks, setRecentUnlocks] = useState<Achievement[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTab, setActiveTab] = useState('achievements');

  useEffect(() => {
    loadAchievements();
    loadUserLevel();
    loadLeaderboard();
  }, []);

  const loadAchievements = () => {
    // Mock achievements data
    const mockAchievements: Achievement[] = [
      {
        id: 'first_purchase',
        title: 'Primo Acquisto',
        description: 'Completa il tuo primo ordine su GameAll',
        category: 'shopping',
        type: 'bronze',
        icon: <ShoppingCart className="h-6 w-6" />,
        xpReward: 100,
        unlocked: true,
        unlockedAt: new Date('2024-07-10'),
        progress: 1,
        maxProgress: 1,
        requirement: 'Effettua un acquisto'
      },
      {
        id: 'spender',
        title: 'Grande Spender',
        description: 'Spendi oltre €500 in totale',
        category: 'shopping',
        type: 'silver',
        icon: <DollarSign className="h-6 w-6" />,
        xpReward: 250,
        unlocked: false,
        progress: 347,
        maxProgress: 500,
        requirement: 'Spendi €500 in totale'
      },
      {
        id: 'collector',
        title: 'Collezionista',
        description: 'Acquista 50 prodotti diversi',
        category: 'shopping',
        type: 'gold',
        icon: <Package className="h-6 w-6" />,
        xpReward: 500,
        unlocked: false,
        progress: 23,
        maxProgress: 50,
        requirement: 'Acquista 50 prodotti diversi'
      },
      {
        id: 'social_butterfly',
        title: 'Farfalla Sociale',
        description: 'Scrivi 25 recensioni',
        category: 'social',
        type: 'silver',
        icon: <MessageCircle className="h-6 w-6" />,
        xpReward: 200,
        unlocked: true,
        unlockedAt: new Date('2024-07-14'),
        progress: 25,
        maxProgress: 25,
        requirement: 'Scrivi 25 recensioni'
      },
      {
        id: 'helpful_reviewer',
        title: 'Recensore Utile',
        description: 'Ricevi 100 "helpful" sulle tue recensioni',
        category: 'social',
        type: 'gold',
        icon: <Heart className="h-6 w-6" />,
        xpReward: 400,
        unlocked: false,
        progress: 67,
        maxProgress: 100,
        requirement: 'Ricevi 100 "helpful"'
      },
      {
        id: 'early_bird',
        title: 'Mattiniero',
        description: 'Effettua 10 acquisti prima delle 8:00',
        category: 'engagement',
        type: 'bronze',
        icon: <Clock className="h-6 w-6" />,
        xpReward: 150,
        unlocked: false,
        progress: 3,
        maxProgress: 10,
        requirement: 'Acquista prima delle 8:00 per 10 volte'
      },
      {
        id: 'chat_master',
        title: 'Chat Master',
        description: 'Usa la live chat per 50 volte',
        category: 'engagement',
        type: 'silver',
        icon: <MessageCircle className="h-6 w-6" />,
        xpReward: 200,
        unlocked: false,
        progress: 31,
        maxProgress: 50,
        requirement: 'Usa la chat 50 volte'
      },
      {
        id: 'loyalty_legend',
        title: 'Leggenda della Fedeltà',
        description: 'Mantieni uno streak di 365 giorni',
        category: 'special',
        type: 'legendary',
        icon: <Crown className="h-6 w-6" />,
        xpReward: 2000,
        unlocked: false,
        progress: 89,
        maxProgress: 365,
        requirement: 'Streak di 365 giorni',
        secret: true
      },
      {
        id: 'speed_demon',
        title: 'Demone della Velocità',
        description: 'Completa un acquisto in meno di 60 secondi',
        category: 'special',
        type: 'platinum',
        icon: <Zap className="h-6 w-6" />,
        xpReward: 1000,
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        requirement: 'Acquisto in <60 secondi',
        secret: true
      }
    ];

    setAchievements(mockAchievements);
    
    // Recent unlocks
    const recent = mockAchievements.filter(a => 
      a.unlocked && a.unlockedAt && 
      Date.now() - a.unlockedAt.getTime() < 7 * 24 * 60 * 60 * 1000
    );
    setRecentUnlocks(recent);
  };

  const loadUserLevel = () => {
    // Mock user level data
    const mockUserLevel: UserLevel = {
      level: 12,
      currentXP: 2750,
      xpToNext: 1250,
      totalXP: 8950,
      title: 'Gaming Enthusiast',
      perks: [
        'Sconto 5% su tutti gli acquisti',
        'Accesso anticipato alle offerte',
        'Spedizione gratuita',
        'Chat prioritaria con supporto'
      ]
    };

    setUserLevel(mockUserLevel);
  };

  const loadLeaderboard = () => {
    // Mock leaderboard data
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        rank: 1,
        userId: '1',
        username: 'GamerPro2024',
        avatar: '/api/placeholder/40/40',
        level: 25,
        totalXP: 24567,
        achievements: 47,
        points: 98750
      },
      {
        rank: 2,
        userId: '2', 
        username: 'ConsoleKing',
        avatar: '/api/placeholder/40/40',
        level: 23,
        totalXP: 21890,
        achievements: 42,
        points: 87650
      },
      {
        rank: 3,
        userId: '3',
        username: 'RetroGamer',
        avatar: '/api/placeholder/40/40',
        level: 21,
        totalXP: 19234,
        achievements: 38,
        points: 76540
      },
      {
        rank: 4,
        userId: 'current',
        username: 'Tu',
        avatar: '/api/placeholder/40/40',
        level: 12,
        totalXP: 8950,
        achievements: 15,
        points: 35800
      }
    ];

    setLeaderboard(mockLeaderboard);
  };

  const getAchievementColor = (type: Achievement['type']) => {
    const colors = {
      bronze: 'bg-amber-100 text-amber-800 border-amber-300',
      silver: 'bg-gray-100 text-gray-800 border-gray-300',
      gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      platinum: 'bg-purple-100 text-purple-800 border-purple-300',
      legendary: 'bg-gradient-to-r from-orange-100 to-red-100 text-red-800 border-red-300'
    };
    return colors[type];
  };

  const getAchievementIcon = (type: Achievement['type']) => {
    const icons = {
      bronze: <Medal className="h-4 w-4" />,
      silver: <Award className="h-4 w-4" />,
      gold: <Trophy className="h-4 w-4" />,
      platinum: <Star className="h-4 w-4" />,
      legendary: <Crown className="h-4 w-4" />
    };
    return icons[type];
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'unlocked') return achievement.unlocked;
    if (selectedCategory === 'locked') return !achievement.unlocked;
    return achievement.category === selectedCategory;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3"
          >
            <Trophy className="h-10 w-10 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900">Achievement Center</h1>
            <Trophy className="h-10 w-10 text-yellow-500" />
          </motion.div>
          <p className="text-lg text-gray-600">
            Sblocca achievement, guadagna XP e scala la classifica!
          </p>
        </div>

        {/* User Level Card */}
        {userLevel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold">{userLevel.level}</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Crown className="h-3 w-3 text-yellow-800" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{userLevel.title}</h3>
                      <p className="text-white/80">Livello {userLevel.level}</p>
                      <p className="text-sm text-white/60">{userLevel.currentXP.toLocaleString()} XP totali</p>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm">
                        {userLevel.xpToNext.toLocaleString()} XP al prossimo livello
                      </span>
                    </div>
                    <Progress 
                      value={(userLevel.currentXP / (userLevel.currentXP + userLevel.xpToNext)) * 100} 
                      className="w-48 bg-white/20"
                    />
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {unlockedCount}/{totalCount} Achievement
                      </Badge>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {Math.round(completionPercentage)}% Completo
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Unlocks */}
        {recentUnlocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  Achievement Recenti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {recentUnlocks.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      whileHover={{ scale: 1.05 }}
                      className="flex-shrink-0 w-48 p-3 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-green-600">{achievement.icon}</div>
                        <Badge className={getAchievementColor(achievement.type)}>
                          {getAchievementIcon(achievement.type)}
                          {achievement.type}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm">{achievement.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs font-medium text-yellow-600">
                          +{achievement.xpReward} XP
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="achievements">Achievement</TabsTrigger>
            <TabsTrigger value="leaderboard">Classifica</TabsTrigger>
            <TabsTrigger value="perks">Vantaggi</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-4">
            {/* Category Filter */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'Tutti', icon: <Target className="h-4 w-4" /> },
                    { id: 'unlocked', label: 'Sbloccati', icon: <Unlock className="h-4 w-4" /> },
                    { id: 'locked', label: 'Bloccati', icon: <Lock className="h-4 w-4" /> },
                    { id: 'shopping', label: 'Shopping', icon: <ShoppingCart className="h-4 w-4" /> },
                    { id: 'social', label: 'Social', icon: <Users className="h-4 w-4" /> },
                    { id: 'engagement', label: 'Coinvolgimento', icon: <TrendingUp className="h-4 w-4" /> },
                    { id: 'special', label: 'Speciali', icon: <Star className="h-4 w-4" /> }
                  ].map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-2"
                    >
                      {category.icon}
                      {category.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                    achievement.unlocked 
                      ? 'border-green-200 bg-green-50/30' 
                      : achievement.secret && achievement.progress === 0
                        ? 'border-gray-200 bg-gray-50 opacity-60'
                        : 'border-gray-200'
                  }`}>
                    <CardContent className="p-4">
                      {/* Achievement Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${
                          achievement.unlocked 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {achievement.secret && !achievement.unlocked && achievement.progress === 0 ? (
                            <Lock className="h-6 w-6" />
                          ) : (
                            achievement.icon
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Badge className={getAchievementColor(achievement.type)}>
                            {getAchievementIcon(achievement.type)}
                            {achievement.type}
                          </Badge>
                          {achievement.unlocked && (
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              <Unlock className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Achievement Content */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">
                          {achievement.secret && !achievement.unlocked && achievement.progress === 0
                            ? '??? Achievement Segreto'
                            : achievement.title
                          }
                        </h3>
                        <p className="text-sm text-gray-600">
                          {achievement.secret && !achievement.unlocked && achievement.progress === 0
                            ? 'Continua a giocare per scoprire questo achievement...'
                            : achievement.description
                          }
                        </p>

                        {/* Progress Bar */}
                        {!achievement.unlocked && achievement.maxProgress > 1 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Progresso</span>
                              <span>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <Progress 
                              value={(achievement.progress / achievement.maxProgress) * 100}
                              className="h-2"
                            />
                          </div>
                        )}

                        {/* XP Reward */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium text-yellow-600">
                              {achievement.xpReward} XP
                            </span>
                          </div>
                          {achievement.unlocked && achievement.unlockedAt && (
                            <span className="text-xs text-gray-500">
                              {achievement.unlockedAt.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Classifica Globale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        entry.userId === 'current' 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'bg-gray-50'
                      }`}
                    >
                      {/* Rank */}
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
                        entry.rank === 3 ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {entry.rank <= 3 ? (
                          entry.rank === 1 ? <Crown className="h-4 w-4" /> :
                          entry.rank === 2 ? <Medal className="h-4 w-4" /> :
                          <Award className="h-4 w-4" />
                        ) : (
                          entry.rank
                        )}
                      </div>

                      {/* User Info */}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.avatar} />
                        <AvatarFallback>{entry.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{entry.username}</h4>
                          {entry.userId === 'current' && (
                            <Badge variant="secondary">Tu</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">Livello {entry.level}</p>
                      </div>

                      {/* Stats */}
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-yellow-500" />
                            <span>{entry.totalXP.toLocaleString()} XP</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="h-3 w-3 text-blue-500" />
                            <span>{entry.achievements}</span>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900">
                          {entry.points.toLocaleString()} pts
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perks" className="space-y-4">
            {userLevel && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-purple-500" />
                    Vantaggi Livello {userLevel.level}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userLevel.perks.map((perk, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg"
                      >
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        <span className="text-purple-800 font-medium">{perk}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Level Progression */}
            <Card>
              <CardHeader>
                <CardTitle>Progressione Livelli</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { level: 15, title: 'Gaming Expert', perks: ['Sconto 7.5%', 'Cashback 2%'] },
                    { level: 20, title: 'Console Master', perks: ['Sconto 10%', 'Accesso beta'] },
                    { level: 25, title: 'Gaming Legend', perks: ['Sconto 15%', 'Supporto VIP'] },
                    { level: 50, title: 'GameAll Ambassador', perks: ['Sconto 25%', 'Eventi esclusivi'] }
                  ].map((levelInfo, index) => (
                    <div key={levelInfo.level} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {levelInfo.level}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{levelInfo.title}</h4>
                        <div className="flex gap-2 mt-1">
                          {levelInfo.perks.map((perk, perkIndex) => (
                            <Badge key={perkIndex} variant="secondary" className="text-xs">
                              {perk}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {userLevel && userLevel.level >= levelInfo.level ? (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          <Unlock className="h-3 w-3 mr-1" />
                          Sbloccato
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Lock className="h-3 w-3 mr-1" />
                          Bloccato
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}