export type Tea = {
  id: string
  name: string
  type: TeaType
  description: string
  benefits: string[]
  brewing: BrewingInstructions
  origin: string
  rating?: number
  reviews?: Review[]
  imageUrl?: string
}

export type TeaType = 
  | 'Black'
  | 'Green'
  | 'Oolong'
  | 'White'
  | 'Pu-erh'
  | 'Herbal'
  | 'Rooibos'
  | 'Blend'

export type BrewingInstructions = {
  temperature: number // in Celsius
  steepTime: number // in minutes
  servingSize: number // in grams
  waterAmount: number // in ml
  resteeps?: number
}

export type Review = {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: Date
  updatedAt?: Date
}

export type TeaCollection = {
  id: string
  name: string
  description: string
  teas: Tea[]
  curator: string
  imageUrl?: string
}
