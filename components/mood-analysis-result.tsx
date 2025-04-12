import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MoodAnalysisResultProps {
  analysis: {
    mood_score: number
    emotions: string[]
    themes: string[]
    summary: string
  }
}

export default function MoodAnalysisResult({ analysis }: MoodAnalysisResultProps) {
  // Function to determine mood level based on score
  const getMoodLevel = (score: number) => {
    if (score >= 80) return { level: "Very Positive", color: "bg-green-500" }
    if (score >= 60) return { level: "Positive", color: "bg-green-400" }
    if (score >= 40) return { level: "Neutral", color: "bg-blue-400" }
    if (score >= 20) return { level: "Negative", color: "bg-orange-400" }
    return { level: "Very Negative", color: "bg-red-500" }
  }

  const mood = getMoodLevel(analysis.mood_score)

  return (
    <Card className="overflow-hidden border-zinc-200">
      <CardContent className="p-0">
        <div className="bg-zinc-50 p-4">
          <h3 className="mb-2 text-lg font-medium text-zinc-900">Mood Analysis</h3>
          <p className="text-sm text-zinc-600">{analysis.summary}</p>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700">Mood Score: {analysis.mood_score}/100</span>
              <span className="text-sm font-medium text-zinc-700">{mood.level}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
              <div className={`h-full rounded-full ${mood.color}`} style={{ width: `${analysis.mood_score}%` }}></div>
            </div>
          </div>
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-zinc-700">Emotions</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.emotions.map((emotion) => (
                <Badge key={emotion} variant="outline" className="border-zinc-200 bg-zinc-50 text-zinc-800">
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-zinc-700">Themes</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.themes.map((theme) => (
                <Badge key={theme} className="bg-black text-white hover:bg-zinc-800">
                  {theme}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
