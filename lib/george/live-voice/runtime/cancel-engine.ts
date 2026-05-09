class GeorgeCancelEngine {
  private generation = 0

  bump() {
    this.generation += 1
    return this.generation
  }

  current() {
    return this.generation
  }

  isExpired(gen: number) {
    return gen !== this.generation
  }
}

export const georgeCancelEngine =
  new GeorgeCancelEngine()
