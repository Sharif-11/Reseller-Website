// interface CourierData {
//   courier: string
//   delivered: number
//   returned: number
//   total: number
//   ratio: string
// }

// interface ReliabilityScore {
//   courier: string
//   score: number
//   breakdown: {
//     deliveryRate: number
//     volumeConfidence: number
//     consistencyScore: number
//     riskPenalty: number
//   }
//   grade: string
// }

// class CourierReliabilityScorer {
//   private readonly WEIGHTS = {
//     DELIVERY_RATE: 0.4, // 40% - Most important factor
//     VOLUME_CONFIDENCE: 0.25, // 25% - Higher volume = more reliable data
//     CONSISTENCY: 0.2, // 20% - Consistent performance over time
//     RISK_PENALTY: 0.15, // 15% - Penalty for high return rates
//   }

//   private readonly VOLUME_THRESHOLDS = {
//     LOW: 5,
//     MEDIUM: 20,
//     HIGH: 50,
//   }

//   /**
//    * Calculate delivery success rate (0-100)
//    */
//   private calculateDeliveryRate(data: CourierData): number {
//     if (data.total === 0) return 0
//     return (data.delivered / data.total) * 100
//   }

//   /**
//    * Calculate volume confidence score (0-100)
//    * Higher volume = more reliable data = higher confidence
//    */
//   private calculateVolumeConfidence(data: CourierData): number {
//     const { total } = data

//     if (total === 0) return 0
//     if (total >= this.VOLUME_THRESHOLDS.HIGH) return 100
//     if (total >= this.VOLUME_THRESHOLDS.MEDIUM) return 80
//     if (total >= this.VOLUME_THRESHOLDS.LOW) return 60

//     // Scale linearly for very low volumes
//     return Math.min(60, (total / this.VOLUME_THRESHOLDS.LOW) * 60)
//   }

//   /**
//    * Calculate consistency score (0-100)
//    * Penalizes extreme ratios with low volume
//    */
//   private calculateConsistencyScore(data: CourierData): number {
//     const { total, delivered, returned } = data

//     if (total === 0) return 0
//     if (total >= this.VOLUME_THRESHOLDS.MEDIUM) return 100

//     // For low volumes, perfect scores are less reliable
//     const deliveryRate = this.calculateDeliveryRate(data)

//     if (deliveryRate === 100 && total < this.VOLUME_THRESHOLDS.LOW) {
//       // Perfect delivery with very low volume is less consistent
//       return 70 + (total / this.VOLUME_THRESHOLDS.LOW) * 30
//     }

//     if (deliveryRate === 0 && total < this.VOLUME_THRESHOLDS.LOW) {
//       // Zero delivery with very low volume might be temporary
//       return 30 + (total / this.VOLUME_THRESHOLDS.LOW) * 20
//     }

//     // Moderate performance is more consistent
//     return Math.min(100, 85 + (total / this.VOLUME_THRESHOLDS.MEDIUM) * 15)
//   }

//   /**
//    * Calculate risk penalty (0-100, where 100 means no penalty)
//    */
//   private calculateRiskPenalty(data: CourierData): number {
//     const { total, returned } = data

//     if (total === 0) return 100

//     const returnRate = (returned / total) * 100

//     // Progressive penalty for return rates
//     if (returnRate === 0) return 100
//     if (returnRate <= 5) return 95
//     if (returnRate <= 10) return 85
//     if (returnRate <= 20) return 70
//     if (returnRate <= 30) return 50

//     return Math.max(20, 100 - returnRate * 2)
//   }

//   /**
//    * Determine grade based on score
//    */
//   private getGrade(score: number): string {
//     if (score >= 90) return 'A+'
//     if (score >= 85) return 'A'
//     if (score >= 80) return 'A-'
//     if (score >= 75) return 'B+'
//     if (score >= 70) return 'B'
//     if (score >= 65) return 'B-'
//     if (score >= 60) return 'C+'
//     if (score >= 55) return 'C'
//     if (score >= 50) return 'C-'
//     if (score >= 40) return 'D'
//     return 'F'
//   }

//   /**
//    * Calculate comprehensive reliability score for a single courier
//    */
//   calculateScore(data: CourierData): ReliabilityScore {
//     const breakdown = {
//       deliveryRate: this.calculateDeliveryRate(data),
//       volumeConfidence: this.calculateVolumeConfidence(data),
//       consistencyScore: this.calculateConsistencyScore(data),
//       riskPenalty: this.calculateRiskPenalty(data),
//     }

//     // Weighted average calculation
//     const score = Math.round(
//       breakdown.deliveryRate * this.WEIGHTS.DELIVERY_RATE +
//         breakdown.volumeConfidence * this.WEIGHTS.VOLUME_CONFIDENCE +
//         breakdown.consistencyScore * this.WEIGHTS.CONSISTENCY +
//         breakdown.riskPenalty * this.WEIGHTS.RISK_PENALTY
//     )

//     return {
//       courier: data.courier,
//       score: Math.max(0, Math.min(100, score)),
//       breakdown,
//       grade: this.getGrade(score),
//     }
//   }

//   /**
//    * Calculate reliability scores for an array of courier data
//    */
//   calculateReliabilityScores(courierData: CourierData[]): ReliabilityScore[] {
//     return courierData.map(data => this.calculateScore(data)).sort((a, b) => b.score - a.score) // Sort by score descending
//   }

//   /**
//    * Get summary statistics for the entire courier network
//    */
//   getNetworkSummary(courierData: CourierData[]) {
//     const scores = this.calculateReliabilityScores(courierData)
//     const validScores = scores.filter(s => s.score > 0)

//     if (validScores.length === 0) {
//       return {
//         averageScore: 0,
//         topPerformer: null,
//         totalVolume: 0,
//         networkHealth: 'Poor',
//       }
//     }

//     const averageScore = validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length
//     const totalVolume = courierData.reduce((sum, d) => sum + d.total, 0)

//     let networkHealth = 'Poor'
//     if (averageScore >= 80) networkHealth = 'Excellent'
//     else if (averageScore >= 70) networkHealth = 'Good'
//     else if (averageScore >= 60) networkHealth = 'Fair'

//     return {
//       averageScore: Math.round(averageScore),
//       topPerformer: validScores[0],
//       totalVolume,
//       networkHealth,
//     }
//   }
// }

// // Usage example and helper function
// function analyzeCourierReliability(courierData: CourierData[]): {
//   scores: ReliabilityScore[]
//   summary: ReturnType<CourierReliabilityScorer['getNetworkSummary']>
// } {
//   const scorer = new CourierReliabilityScorer()

//   return {
//     scores: scorer.calculateReliabilityScores(courierData),
//     summary: scorer.getNetworkSummary(courierData),
//   }
// }

// // Example usage with your data
// const exampleData: CourierData[] = [
//   {
//     courier: 'Pathao',
//     delivered: 1,
//     returned: 0,
//     total: 1,
//     ratio: '100.00%',
//   },
//   {
//     courier: 'Paperfly',
//     delivered: 0,
//     returned: 0,
//     total: 0,
//     ratio: '0%',
//   },
//   {
//     courier: 'RedX',
//     delivered: 1,
//     returned: 0,
//     total: 1,
//     ratio: '100.00%',
//   },
//   {
//     courier: 'SteadFast',
//     delivered: 0,
//     returned: 0,
//     total: 0,
//     ratio: '0%',
//   },
// ]

// // Run the analysis
// const result = analyzeCourierReliability(exampleData)
// console.log('Reliability Scores:', result.scores)
// console.log('Network Summary:', result.summary)

// export { analyzeCourierReliability, CourierReliabilityScorer }
// export type { CourierData, ReliabilityScore }
