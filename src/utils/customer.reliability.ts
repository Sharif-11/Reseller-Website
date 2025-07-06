export interface CourierData {
  courier: string
  delivered: number
  returned: number
  total: number
  ratio: string
}

export interface SimplifiedResult {
  totalOrders: number
  completedOrders: number
  returnedOrders: number
  reliabilityScore: number
  riskLevel: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'
  confidenceLevel: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'
  flags: string[]
}

export interface CourierAnalysis {
  courier: string
  successRate: number
  orderCount: number
  riskScore: number
  flags: string[]
}

class EnhancedReliabilityChecker {
  // Volume thresholds for confidence calculation
  private readonly VOLUME_THRESHOLDS = {
    VERY_LOW: 0, // No orders
    LOW: 5, // 1-5 orders
    MODERATE: 20, // 6-20 orders
    HIGH: 50, // 21-50 orders
    VERY_HIGH: 100, // 50+ orders
  }

  // Success rate thresholds
  private readonly SUCCESS_THRESHOLDS = {
    EXCELLENT: 95, // 95%+
    GOOD: 85, // 85-94%
    AVERAGE: 70, // 70-84%
    POOR: 50, // 50-69%
    VERY_POOR: 0, // Below 50%
  }

  // Risk factors for fraud detection
  private readonly FRAUD_INDICATORS = {
    SINGLE_COURIER_DOMINANCE: 0.8, // 80% of orders from one courier
    HIGH_RETURN_RATE: 0.3, // 30% return rate
    COURIER_SPECIFIC_FAILURE: 0.5, // 50% failure with specific courier
    EXTREME_INCONSISTENCY: 0.4, // Large variance between couriers
  }

  private calculateSuccessRate(delivered: number, total: number): number {
    if (total === 0) return 0
    return (delivered / total) * 100
  }

  private calculateReturnRate(returned: number, total: number): number {
    if (total === 0) return 0
    return (returned / total) * 100
  }

  private getVolumeConfidence(total: number): number {
    if (total === 0) return 0
    if (total >= this.VOLUME_THRESHOLDS.VERY_HIGH) return 1.0
    if (total >= this.VOLUME_THRESHOLDS.HIGH) return 0.9
    if (total >= this.VOLUME_THRESHOLDS.MODERATE) return 0.7
    if (total >= this.VOLUME_THRESHOLDS.LOW) return 0.5
    return 0.3
  }

  private analyzeCourierSpecificRisks(courierData: CourierData[]): CourierAnalysis[] {
    return courierData.map(courier => {
      const successRate = this.calculateSuccessRate(courier.delivered, courier.total)
      const returnRate = this.calculateReturnRate(courier.returned, courier.total)
      const flags: string[] = []
      let riskScore = 0

      // Check for courier-specific issues
      if (courier.total > 0) {
        if (returnRate > 50) {
          flags.push('HIGH_RETURN_RATE')
          riskScore += 40
        } else if (returnRate > 30) {
          flags.push('MODERATE_RETURN_RATE')
          riskScore += 20
        }

        if (successRate < 30) {
          flags.push('VERY_LOW_SUCCESS')
          riskScore += 50
        } else if (successRate < 50) {
          flags.push('LOW_SUCCESS')
          riskScore += 30
        }

        if (courier.total === 1 && courier.returned === 1) {
          flags.push('SINGLE_ORDER_FAILURE')
          riskScore += 25
        }
      }

      return {
        courier: courier.courier,
        successRate,
        orderCount: courier.total,
        riskScore,
        flags,
      }
    })
  }

  private detectFraudPatterns(
    courierData: CourierData[],
    courierAnalysis: CourierAnalysis[]
  ): string[] {
    const flags: string[] = []
    const totalOrders = courierData.reduce((sum, c) => sum + c.total, 0)

    if (totalOrders === 0) return flags

    // Check for single courier dominance
    const maxCourierOrders = Math.max(...courierData.map(c => c.total))
    if (maxCourierOrders / totalOrders > this.FRAUD_INDICATORS.SINGLE_COURIER_DOMINANCE) {
      flags.push('SINGLE_COURIER_DOMINANCE')
    }

    // Check for courier-specific targeting
    const courierSuccessRates = courierAnalysis
      .filter(c => c.orderCount > 0)
      .map(c => c.successRate)
    if (courierSuccessRates.length > 1) {
      const maxSuccess = Math.max(...courierSuccessRates)
      const minSuccess = Math.min(...courierSuccessRates)
      if (maxSuccess - minSuccess > 50) {
        flags.push('COURIER_TARGETING_SUSPECTED')
      }
    }

    // Check for selective fraud (good with some, bad with others)
    const highPerformingCouriers = courierAnalysis.filter(
      c => c.successRate > 80 && c.orderCount > 2
    )
    const lowPerformingCouriers = courierAnalysis.filter(
      c => c.successRate < 50 && c.orderCount > 2
    )

    if (highPerformingCouriers.length > 0 && lowPerformingCouriers.length > 0) {
      flags.push('SELECTIVE_FRAUD_PATTERN')
    }

    return flags
  }

  private calculateBaseScore(
    totalOrders: number,
    completedOrders: number,
    returnedOrders: number
  ): number {
    if (totalOrders === 0) return 50 // Neutral for new customers

    const successRate = this.calculateSuccessRate(completedOrders, totalOrders)
    const returnRate = this.calculateReturnRate(returnedOrders, totalOrders)
    const volumeConfidence = this.getVolumeConfidence(totalOrders)

    // Base score primarily depends on success rate
    let baseScore = successRate

    // Adjust based on volume confidence
    if (volumeConfidence < 0.5) {
      // For low volume, be more conservative
      baseScore = baseScore * 0.8 + 40 * 0.2 // Pull towards neutral
    }

    // Penalty for high return rates
    if (returnRate > 20) {
      baseScore *= 1 - (returnRate - 20) / 100
    }

    return Math.max(0, Math.min(100, baseScore))
  }

  private adjustScoreForRiskFactors(
    baseScore: number,
    flags: string[],
    courierAnalysis: CourierAnalysis[]
  ): number {
    let adjustedScore = baseScore
    let penalty = 0

    // Apply penalties for risk flags
    flags.forEach(flag => {
      switch (flag) {
        case 'SINGLE_COURIER_DOMINANCE':
          penalty += 5
          break
        case 'COURIER_TARGETING_SUSPECTED':
          penalty += 15
          break
        case 'SELECTIVE_FRAUD_PATTERN':
          penalty += 25
          break
      }
    })

    // Apply penalties for courier-specific issues
    courierAnalysis.forEach(analysis => {
      penalty += analysis.riskScore * 0.3 // Weighted penalty
    })

    adjustedScore = Math.max(0, baseScore - penalty)
    return Math.min(100, adjustedScore)
  }

  private determineRiskLevel(
    score: number,
    flags: string[]
  ): 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' {
    const hasHighRiskFlags = flags.some(flag =>
      ['SELECTIVE_FRAUD_PATTERN', 'COURIER_TARGETING_SUSPECTED'].includes(flag)
    )

    if (hasHighRiskFlags || score < 20) return 'VERY_HIGH'
    if (score < 40) return 'HIGH'
    if (score < 60) return 'MODERATE'
    if (score < 80) return 'LOW'
    return 'VERY_LOW'
  }

  private determineConfidenceLevel(
    totalOrders: number
  ): 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' {
    if (totalOrders === 0) return 'VERY_LOW'
    if (totalOrders < 5) return 'LOW'
    if (totalOrders < 20) return 'MODERATE'
    if (totalOrders < 50) return 'HIGH'
    return 'VERY_HIGH'
  }

  analyzeCouriers(courierData: CourierData[]): SimplifiedResult {
    const totalOrders = courierData.reduce((sum, c) => sum + c.total, 0)
    const completedOrders = courierData.reduce((sum, c) => sum + c.delivered, 0)
    const returnedOrders = courierData.reduce((sum, c) => sum + c.returned, 0)

    // Analyze each courier separately
    const courierAnalysis = this.analyzeCourierSpecificRisks(courierData)

    // Detect fraud patterns
    const fraudFlags = this.detectFraudPatterns(courierData, courierAnalysis)

    // Collect all flags
    const allFlags = [...fraudFlags, ...courierAnalysis.flatMap(c => c.flags)]

    // Calculate base score
    const baseScore = this.calculateBaseScore(totalOrders, completedOrders, returnedOrders)

    // Apply risk adjustments
    const finalScore = this.adjustScoreForRiskFactors(baseScore, allFlags, courierAnalysis)

    // Determine risk and confidence levels
    const riskLevel = this.determineRiskLevel(finalScore, allFlags)
    const confidenceLevel = this.determineConfidenceLevel(totalOrders)

    return {
      totalOrders,
      completedOrders,
      returnedOrders,
      reliabilityScore: Math.round(finalScore),
      riskLevel,
      confidenceLevel,
      flags: Array.from(new Set(allFlags)), // Remove duplicates
    }
  }
}

export const enhancedReliabilityChecker = new EnhancedReliabilityChecker()

export const calculateReliability = (courierData: CourierData[]): SimplifiedResult => {
  return enhancedReliabilityChecker.analyzeCouriers(courierData)
}

export const getReliabilityMessage = (result: SimplifiedResult): string => {
  const { reliabilityScore, totalOrders, riskLevel, confidenceLevel, flags } = result

  // Handle no order history
  if (totalOrders === 0) {
    return 'এই কাস্টমারের কোনো অর্ডার ইতিহাস নেই। প্রাথমিক সতর্কতা নিন এবং ছোট অর্ডার দিয়ে শুরু করুন।'
  }

  // Base message based on score
  let message = ''
  if (reliabilityScore >= 85) {
    message = 'অত্যন্ত বিশ্বস্ত কাস্টমার! উচ্চমূল্যের অর্ডারেও আত্মবিশ্বাসী থাকুন।'
  } else if (reliabilityScore >= 70) {
    message = 'নির্ভরযোগ্য কাস্টমার। নিয়মিত অর্ডার গ্রহণে কোনো সমস্যা নেই।'
  } else if (reliabilityScore >= 50) {
    message = 'মাঝারি মানের কাস্টমার। অর্ডার নিশ্চিত করতে অতিরিক্ত যোগাযোগ করুন।'
  } else if (reliabilityScore >= 30) {
    message = 'ঝুঁকিপূর্ণ কাস্টমার। অগ্রীম পেমেন্ট বা কম অর্ডার বিবেচনা করুন।'
  } else {
    message = 'অত্যন্ত ঝুঁকিপূর্ণ কাস্টমার! বিশেষ ব্যবস্থা ছাড়া অর্ডার এড়িয়ে চলুন।'
  }

  // Add confidence level warning
  if (confidenceLevel === 'VERY_LOW' || confidenceLevel === 'LOW') {
    message += ' (সীমিত তথ্যের কারণে সতর্কতা প্রয়োজন)'
  }

  // Add specific risk warnings
  if (flags.includes('SELECTIVE_FRAUD_PATTERN')) {
    message += ' ⚠️ নির্দিষ্ট কুরিয়ারের সাথে সমস্যার ইতিহাস রয়েছে!'
  }

  if (flags.includes('COURIER_TARGETING_SUSPECTED')) {
    message += ' ⚠️ কুরিয়ার ভিত্তিক প্রতারণার সন্দেহ রয়েছে!'
  }

  if (flags.includes('HIGH_RETURN_RATE')) {
    message += ' ⚠️ উচ্চ রিটার্ন রেট!'
  }

  return message
}

// Example usage and test cases
export const testCases = {
  // Test case 1: No order history
  noHistory: [],

  // Test case 2: 100% success with low volume
  perfectLowVolume: [{ courier: 'A', delivered: 3, returned: 0, total: 3, ratio: '100%' }],

  // Test case 3: 100% success with high volume
  perfectHighVolume: [{ courier: 'A', delivered: 50, returned: 0, total: 50, ratio: '100%' }],

  // Test case 4: High return rate with single courier
  highReturnSingleCourier: [{ courier: 'A', delivered: 2, returned: 8, total: 10, ratio: '20%' }],

  // Test case 5: Selective fraud pattern
  selectiveFraud: [
    { courier: 'A', delivered: 10, returned: 0, total: 10, ratio: '100%' },
    { courier: 'B', delivered: 1, returned: 9, total: 10, ratio: '10%' },
  ],

  // Test case 6: Moderate performance with mixed couriers
  moderatePerformance: [
    { courier: 'A', delivered: 15, returned: 5, total: 20, ratio: '75%' },
    { courier: 'B', delivered: 12, returned: 8, total: 20, ratio: '60%' },
  ],
}
