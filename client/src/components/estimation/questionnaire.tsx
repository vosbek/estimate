'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EstimationFlow, EstimationAnswer, EstimationQuestion, mockTeams } from '@/types/estimation'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from "@/components/ui/progress"

interface EstimationQuestionnaireProps {
  flow: EstimationFlow
}

export function EstimationQuestionnaire({ flow }: EstimationQuestionnaireProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<EstimationAnswer[]>([])
  const [isComplete, setIsComplete] = useState(false)

  const currentQuestion = flow.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / flow.questions.length) * 100

  const handleAnswer = (value: string | string[] | number) => {
    const newAnswers = [
      ...answers.filter(a => a.questionId !== currentQuestion.id),
      { questionId: currentQuestion.id, value }
    ]
    setAnswers(newAnswers)

    if (currentQuestionIndex < flow.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setIsComplete(true)
      calculateEstimate(newAnswers)
    }
  }

  const calculateEstimate = (answers: EstimationAnswer[]) => {
    const teamEstimates = new Map<string, number>()

    // Initialize base hours for each team
    mockTeams.forEach(team => {
      teamEstimates.set(team.id, team.baseHours)
    })

    // Apply multipliers based on answers
    flow.questions.forEach(question => {
      const answer = answers.find(a => a.questionId === question.id)
      if (answer && question.impactedTeams) {
        question.impactedTeams.forEach(impact => {
          if (answer.value === impact.condition) {
            const currentHours = teamEstimates.get(impact.teamId) || 0
            teamEstimates.set(impact.teamId, currentHours * impact.multiplier)
          }
        })
      }
    })

    // For demonstration, just log the results
    const estimates = Object.fromEntries(teamEstimates)
    const totalHours = Array.from(teamEstimates.values()).reduce((a, b) => a + b, 0)
    
    console.log('Team Estimates:', estimates)
    console.log('Total Hours:', totalHours)
  }

  const renderQuestion = (question: EstimationQuestion) => {
    switch (question.type) {
      case 'SINGLE_SELECT':
        return (
          <Select onValueChange={handleAnswer}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'YES_NO':
        return (
          <RadioGroup
            onValueChange={handleAnswer}
            className="grid grid-cols-2 gap-4"
          >
            <Label
              htmlFor={`${question.id}-yes`}
              className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <RadioGroupItem value="true" id={`${question.id}-yes`} className="sr-only" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 mb-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              <span className="text-sm font-medium">Yes</span>
            </Label>
            <Label
              htmlFor={`${question.id}-no`}
              className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <RadioGroupItem value="false" id={`${question.id}-no`} className="sr-only" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 mb-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="text-sm font-medium">No</span>
            </Label>
          </RadioGroup>
        )
      
      default:
        return null
    }
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-lg bg-primary/10 p-6 border border-primary/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-card-foreground">Estimation Complete</h3>
              <p className="text-muted-foreground">Your results have been calculated.</p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/'}
          className="w-full"
        >
          Start New Estimation
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {flow.questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">{currentQuestion.text}</h3>
            {renderQuestion(currentQuestion)}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentQuestionIndex(Math.min(flow.questions.length - 1, currentQuestionIndex + 1))}
          disabled={currentQuestionIndex === flow.questions.length - 1 || !answers.find(a => a.questionId === currentQuestion.id)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Next
        </Button>
      </div>
    </div>
  )
} 