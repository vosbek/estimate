export type EstimationPath = 'NEW_LIFE_PRODUCT' | 'EXISTING_LIFE_PRODUCT' | 'ADD_RIDER' | 'CHANGE_STATIC_CONTENT' | 'ADD_FILE_TRANSFER';

export type QuestionType = 'SINGLE_SELECT' | 'MULTI_SELECT' | 'YES_NO' | 'NUMBER';

export interface EstimationTeam {
  id: string;
  name: string;
  baseHours: number;
  multipliers: Record<string, number>;
}

export interface EstimationQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  dependsOn?: {
    questionId: string;
    value: string | string[];
  };
  impactedTeams?: {
    teamId: string;
    condition: string;
    multiplier: number;
  }[];
}

export interface EstimationFlow {
  id: string;
  path: EstimationPath;
  name: string;
  description: string;
  questions: EstimationQuestion[];
}

export interface EstimationAnswer {
  questionId: string;
  value: string | string[] | number;
}

export interface EstimationResult {
  id: string;
  path: EstimationPath;
  timestamp: string;
  userId: string;
  answers: EstimationAnswer[];
  teamEstimates: {
    teamId: string;
    hours: number;
  }[];
  totalHours: number;
}

// Initial mock data structure
export const mockTeams: EstimationTeam[] = [
  {
    id: 'life_db',
    name: 'Life Database Team',
    baseHours: 100,
    multipliers: {
      'new_rider': 1.2,
      'complex_integration': 1.5
    }
  },
  {
    id: 'ui_team',
    name: 'UI Development Team',
    baseHours: 80,
    multipliers: {
      'new_screens': 1.3,
      'complex_validation': 1.4
    }
  }
];

// Example flow for New Life Product
export const mockNewLifeProductFlow: EstimationFlow = {
  id: 'new_life_product',
  path: 'NEW_LIFE_PRODUCT',
  name: 'New Life Product',
  description: 'Estimation flow for creating a new life insurance product',
  questions: [
    {
      id: 'category',
      text: 'Category: Fixed, Variable, or Index',
      type: 'SINGLE_SELECT',
      options: ['Fixed', 'Variable', 'Index'],
      impactedTeams: [
        {
          teamId: 'life_db',
          condition: 'Variable',
          multiplier: 1.5
        }
      ]
    },
    {
      id: 'electronic_delivery',
      text: 'Do you require electronic delivery via SMS and Email?',
      type: 'YES_NO',
      impactedTeams: [
        {
          teamId: 'ui_team',
          condition: 'true',
          multiplier: 1.2
        }
      ]
    }
  ]
}; 