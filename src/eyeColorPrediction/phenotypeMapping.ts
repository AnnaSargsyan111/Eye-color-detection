import { MODELED_COLORS, type ModeledColor, type ProbabilityDistribution } from './types'

/**
 * MODEL PARAMETERS — latent pigmentation axis.
 *
 * These integer positions exist ONLY to order the 7 modeled colors and to let us
 * compute how much two categories should overlap when we turn one observed
 * phenotype into a probability distribution. They are NOT melanin measurements,
 * NOT biological constants, and NOT inheritance coefficients. The spacing is
 * uniform by construction (1 unit apart) so that "distance on the axis" is a
 * pure ordering device, not a claim about biological distance.
 *
 * Conceptual ordering (light -> dark):
 * Blue -> Gray -> Green -> Hazel -> Amber -> Brown -> Black
 */
export const LATENT_AXIS_POSITION: Readonly<Record<ModeledColor, number>> = {
  blue: 0,
  gray: 1,
  green: 2,
  hazel: 3,
  amber: 4,
  brown: 5,
  black: 6,
}

/**
 * MODEL PARAMETER — spread (standard deviation) of the Gaussian kernel used to
 * convert a single observed phenotype into a distribution over all 7 modeled
 * colors. Larger = more overlap/uncertainty from a single observation, smaller
 * = a single observed phenotype is treated as stronger evidence for its own
 * category. This is a calibration knob, not a biological quantity, and should
 * eventually be tuned against real family outcome data.
 */
export const PHENOTYPE_SPREAD = 1.15

/**
 * Converts one observed phenotype into a probability distribution over the 7
 * modeled colors using a Gaussian kernel centered on that phenotype's axis
 * position. Adjacent colors (small axis distance) get more shared probability
 * mass than distant colors, and every color always keeps a strictly positive
 * (if small) probability — a single observation is evidence, never proof.
 */
export function phenotypeToDistribution(color: ModeledColor): ProbabilityDistribution {
  const center = LATENT_AXIS_POSITION[color]
  const weights = {} as Record<ModeledColor, number>
  let sum = 0

  for (const candidate of MODELED_COLORS) {
    const distance = LATENT_AXIS_POSITION[candidate] - center
    const weight = Math.exp(-(distance * distance) / (2 * PHENOTYPE_SPREAD * PHENOTYPE_SPREAD))
    weights[candidate] = weight
    sum += weight
  }

  const distribution = {} as Record<ModeledColor, number>
  for (const candidate of MODELED_COLORS) {
    distribution[candidate] = weights[candidate] / sum
  }
  return distribution
}

/** True for the 7 colors the engine can model; false for "other"/"unknown". */
export function isModeledColor(color: string): color is ModeledColor {
  return (MODELED_COLORS as readonly string[]).includes(color)
}
