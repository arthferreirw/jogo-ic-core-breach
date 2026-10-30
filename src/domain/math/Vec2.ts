/**
 * Vetor bidimensional imutável para cinemática espacial e física em plano 2.5D.
 */
export class Vec2 {
  constructor(public readonly x: number, public readonly y: number) {}

  public add(other: Vec2): Vec2 {
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  public sub(other: Vec2): Vec2 {
    return new Vec2(this.x - other.x, this.y - other.y);
  }

  public scale(scalar: number): Vec2 {
    return new Vec2(this.x * scalar, this.y * scalar);
  }

  public dot(other: Vec2): number {
    return this.x * other.x + this.y * other.y;
  }

  public magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  public magnitude(): number {
    return Math.sqrt(this.magnitudeSquared());
  }

  public normalize(): Vec2 {
    const mag = this.magnitude();
    if (mag === 0) return new Vec2(0, 0);
    return new Vec2(this.x / mag, this.y / mag);
  }

  public distanceTo(other: Vec2): number {
    return this.sub(other).magnitude();
  }
}
