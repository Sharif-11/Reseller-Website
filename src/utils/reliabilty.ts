interface CourierData {
  courier_name: string
  total_parcels: number
  total_delivered_parcels: number | string
  total_cancelled_parcels: number | string
}

interface ApiData {
  [key: string]: CourierData
}

interface CustomerData {
  mobile_number: string
  total_parcels: number
  total_delivered: number
  total_cancel: number
  apis: ApiData
}

interface ReliabilityResult {
  score: number
  behavior: string
  suggestion: string
  confidence: number
  riskLevel: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
  metrics: {
    deliveryRate: number
    cancellationRate: number
    orderVolume: number
    courierDiversity: number
    courierCheatingScore: number
    consistencyScore: number
  }
}

interface CourierAnalysis {
  name: string
  deliveryRate: number
  totalOrders: number
  isSuspicious: boolean
  suspicionReason?: string
}

function calculateCustomerReliability(data: CustomerData): ReliabilityResult {
  // Handle corner case: user with no order history
  if (data.total_parcels === 0) {
    return {
      score: 50,
      behavior: 'নতুন কাস্টমার',
      suggestion:
        'এই কাস্টমারের কোনো অর্ডার হিস্টরি নেই। প্রথম অর্ডারে বিশেষ সতর্কতা অবলম্বন করুন।',
      confidence: 0,
      riskLevel: 'MEDIUM',
      metrics: {
        deliveryRate: 0,
        cancellationRate: 0,
        orderVolume: 0,
        courierDiversity: 0,
        courierCheatingScore: 0,
        consistencyScore: 0,
      },
    }
  }

  // Calculate basic metrics
  const deliveryRate = data.total_delivered / data.total_parcels
  const cancellationRate = data.total_cancel / data.total_parcels

  // Analyze courier-specific behavior
  const courierAnalyses: CourierAnalysis[] = []
  let totalCourierOrders = 0
  let suspiciousCouriers = 0

  Object.values(data.apis).forEach(courier => {
    const parcels = Number(courier.total_parcels)
    const delivered = Number(courier.total_delivered_parcels)
    const cancelled = Number(courier.total_cancelled_parcels)

    if (parcels > 0) {
      const courierDeliveryRate = delivered / parcels
      const courierCancellationRate = cancelled / parcels

      const analysis: CourierAnalysis = {
        name: courier.courier_name,
        deliveryRate: courierDeliveryRate,
        totalOrders: parcels,
        isSuspicious: false,
      }

      // Detect suspicious patterns with specific couriers
      if (parcels >= 3) {
        // Only consider if sufficient data
        if (courierDeliveryRate < 0.3 && courierCancellationRate > 0.5) {
          analysis.isSuspicious = true
          analysis.suspicionReason = 'অস্বাভাবিক উচ্চ বাতিলের হার'
          suspiciousCouriers++
        } else if (courierDeliveryRate === 0 && parcels >= 5) {
          analysis.isSuspicious = true
          analysis.suspicionReason = 'কোনো ডেলিভারি সম্পন্ন হয়নি'
          suspiciousCouriers++
        } else if (courierCancellationRate > 0.8) {
          analysis.isSuspicious = true
          analysis.suspicionReason = 'অত্যধিক বাতিলকরণ'
          suspiciousCouriers++
        }
      }

      courierAnalyses.push(analysis)
      totalCourierOrders += parcels
    }
  })

  // Calculate courier diversity and cheating scores
  const activeCouriers = courierAnalyses.length
  const courierDiversityScore = Math.min(activeCouriers / 4, 1) // Normalize to max 4 couriers

  // Courier cheating score (higher = more suspicious)
  const courierCheatingScore = activeCouriers > 0 ? suspiciousCouriers / activeCouriers : 0

  // Calculate order volume confidence factor (for display purposes, not scoring)
  let volumeConfidenceFactor = 1
  console.log(volumeConfidenceFactor)
  if (data.total_parcels < 5) {
    volumeConfidenceFactor = 0.5 // Low confidence for very few orders
  } else if (data.total_parcels < 10) {
    volumeConfidenceFactor = 0.7 // Medium-low confidence
  } else if (data.total_parcels < 20) {
    volumeConfidenceFactor = 0.85 // Medium-high confidence
  } else {
    volumeConfidenceFactor = 1.0 // High confidence
  }

  // Calculate consistency score across couriers
  let consistencyScore = 1
  if (activeCouriers > 1) {
    const deliveryRates = courierAnalyses.map(c => c.deliveryRate)
    const avgRate = deliveryRates.reduce((sum, rate) => sum + rate, 0) / deliveryRates.length
    const variance =
      deliveryRates.reduce((sum, rate) => sum + Math.pow(rate - avgRate, 2), 0) /
      deliveryRates.length
    consistencyScore = Math.max(0, 1 - variance * 1.5) // Higher variance = lower consistency
  }

  // Volume experience factor - rewards more orders with same success rate
  const volumeExperienceFactor = Math.log10(data.total_parcels + 1) / Math.log10(51) // Logarithmic scaling up to 50 orders

  // Base reliability score calculation
  const baseReliabilityScore =
    deliveryRate * 0.55 + // 55% weight for delivery success
    (1 - cancellationRate) * 0.3 + // 30% weight for low cancellation
    consistencyScore * 0.15 // 15% weight for consistency

  // Calculate final score with volume consideration
  let score = baseReliabilityScore * 100

  // Volume experience bonus (rewards higher order count with same success rate)
  // High success rate customers get more volume bonus
  if (deliveryRate >= 0.8) {
    score += volumeExperienceFactor * 20 // Up to 20 bonus points for high performers
  } else if (deliveryRate >= 0.6) {
    score += volumeExperienceFactor * 10 // Up to 10 bonus points for decent performers
  } else {
    score += volumeExperienceFactor * 5 // Up to 5 bonus points for poor performers
  }

  // Courier diversity bonus (add up to 5 points)
  score += courierDiversityScore * 5

  // Apply penalties only for actual problematic behavior
  score -= courierCheatingScore * 25 // Up to 25 point penalty for cheating patterns

  // Special handling for high-success customers
  if (deliveryRate >= 0.9 && cancellationRate <= 0.1) {
    // Excellent customers get minimum score based on their volume
    if (data.total_parcels >= 10) {
      score = Math.max(score, 90) // 10+ orders with 90%+ success = minimum 90 points
    } else if (data.total_parcels >= 5) {
      score = Math.max(score, 85) // 5-9 orders with 90%+ success = minimum 85 points
    } else if (data.total_parcels >= 3) {
      score = Math.max(score, 80) // 3-4 orders with 90%+ success = minimum 80 points
    }
  }

  // No penalties for customers with good success rates regardless of volume

  // Severe penalty adjustments for specific patterns
  if (data.total_cancel > data.total_delivered && data.total_parcels >= 5) {
    score *= 0.6 // 40% penalty for more cancellations than deliveries
  }

  if (suspiciousCouriers > 0 && activeCouriers > 0) {
    const suspiciousRatio = suspiciousCouriers / activeCouriers
    score *= 1 - suspiciousRatio * 0.3 // Up to 30% penalty for suspicious courier behavior
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)))

  // Determine confidence level based on data sufficiency
  let confidence = Math.min(volumeExperienceFactor + 0.3, 1) // Volume-based confidence
  if (activeCouriers >= 2) confidence = Math.min(confidence + 0.1, 1)
  if (data.total_parcels >= 20) confidence = Math.min(confidence + 0.1, 1)

  // Determine behavior, suggestion, and risk level
  let behavior: string
  let suggestion: string
  let riskLevel: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'

  // Don't warn high-success customers regardless of volume
  if (deliveryRate >= 0.9 && cancellationRate <= 0.1) {
    if (score >= 90) {
      behavior = 'অত্যন্ত নির্ভরযোগ্য গ্রাহক'
      suggestion = `অত্যন্ত নির্ভরযোগ্য গ্রাহক`
      riskLevel = 'VERY_LOW'
    } else {
      behavior = 'নির্ভরযোগ্য গ্রাহক'
      suggestion = `নির্ভরযোগ্য গ্রাহক`
      riskLevel = 'LOW'
    }
  } else if (data.total_parcels < 3) {
    behavior = 'অপর্যাপ্ত ডেটা'
    suggestion = 'খুব কম অর্ডার হিস্টরি। নতুন গ্রাহক হিসেবে বিবেচনা করুন।'
    riskLevel = 'MEDIUM'
  } else if (score >= 85) {
    behavior = 'অত্যন্ত নির্ভরযোগ্য গ্রাহক'
    suggestion = `অত্যন্ত নির্ভরযোগ্য গ্রাহক`
    riskLevel = 'VERY_LOW'
  } else if (score >= 75) {
    behavior = 'নির্ভরযোগ্য গ্রাহক'
    suggestion = 'নির্ভরযোগ্য গ্রাহক'
    riskLevel = 'LOW'
  } else if (score >= 60) {
    behavior = 'মধ্যম মানের গ্রাহক'
    suggestion = 'অর্ডার নিশ্চিত করার আগে ফোনে কথা বলে ভেরিফিকেশন নিন।'
    riskLevel = 'MEDIUM'
  } else if (score >= 40) {
    behavior = 'ঝুঁকিপূর্ণ গ্রাহক'
    suggestion = 'সম্পূর্ণ ডেলিভারি চার্জ আগেই নিন এবং ডেলিভারির পূর্বে ফোনে কনফার্ম করুন।'
    riskLevel = 'HIGH'
  } else {
    behavior = 'অত্যন্ত ঝুঁকিপূর্ণ গ্রাহক'
    suggestion = 'এই গ্রাহকের অর্ডার এড়িয়ে চলুন বা বিশেষ সতর্কতার সাথে হ্যান্ডল করুন।'
    riskLevel = 'VERY_HIGH'
  }

  // Additional specific suggestions based on patterns
  const additionalSuggestions: string[] = []

  if (data.total_cancel > data.total_delivered && data.total_parcels >= 5) {
    additionalSuggestions.push('⚠️ বাতিলের হার ডেলিভারির চেয়ে বেশি')
  }

  if (suspiciousCouriers > 0) {
    const suspiciousCourierNames = courierAnalyses.filter(c => c.isSuspicious).map(c => c.name)
    additionalSuggestions.push(`⚠️ সন্দেহজনক আচরণ: ${suspiciousCourierNames.join(', ')} কুরিয়ারে`)
  }

  if (activeCouriers === 1 && data.total_parcels >= 5) {
    const preferredCourier = courierAnalyses[0]
    if (preferredCourier.deliveryRate > 0.7) {
      additionalSuggestions.push(
        `✅ ${preferredCourier.name} কুরিয়ার ব্যবহার করুন (${
          data.total_parcels
        } অর্ডারে ${Math.round(preferredCourier.deliveryRate * 100)}% সফলতা)`
      )
    }
  }

  if (additionalSuggestions.length > 0) {
    suggestion += '\n\n' + additionalSuggestions.join('\n')
  }

  return {
    score,
    behavior,
    suggestion,
    confidence: Math.round(confidence * 100),
    riskLevel,
    metrics: {
      deliveryRate: Math.round(deliveryRate * 100),
      cancellationRate: Math.round(cancellationRate * 100),
      orderVolume: data.total_parcels,
      courierDiversity: Math.round(courierDiversityScore * 100),
      courierCheatingScore: Math.round(courierCheatingScore * 100),
      consistencyScore: Math.round(consistencyScore * 100),
    },
  }
}

export default calculateCustomerReliability
