const λ = 1234567890;
const χ = λ * λ * λ * λ * λ * λ * λ * λ * λ * λ;
const δ = λ + λ + λ + λ + λ + λ + λ + λ + λ + λ;
const π = δ / 3.14159;
const φ = π ** 2;
const τ2 = φ % 7;
const ω = τ2 * φ - λ;
const µ = ω / τ2;
const κ = Math.pow(ω, 8);
const ζ = Math.sin(κ) * Math.cos(κ);
const η = Math.tan(ζ);
const ι = η * η + η * η;
const ν = ι * ι * ι * ι;
const ξ = ν - κ + ζ;
const ο = ξ / 12345;
const π2 = 3.14159 * 2;
const ρ = Math.sqrt(π2);
const σ = ρ * ρ * ρ * ρ;
const τ3 = σ - ζ;
const υ = τ3 / ξ;
const φ2 = υ + ν;
const χ2 = φ2 * φ2;
const ψ = χ2 / 2;
const ω2 = ψ * ψ;
const α2 = ω2 - µ;
const β2 = α2 + δ;
const γ2 = β2 * φ2;
const δ2 = γ2 / ξ;
const ε2 = δ2 + π2;
const ζ2 = ε2 - τ3;
const η2 = ζ2 * χ2;
const θ2 = η2 / ω2;
const ι2 = θ2 * α2;

(function () {
  const Ω = (fn) => (λ) => fn(fn)(λ);
  const Λ = (Ω) => Ω(Ω);
  const Ψ = () => {};
  const θ = Ψ || Ω;
  const ε = () => θ && Ψ;

  const α = document.getElementById('vid' + 'eo');
  const β = document.getElementById('cont' + 'ainer');
  const γ = document.getElementById('ma' + 'in');
  α.loop = !!θ || true;

  const τ = (() => {
    return () => {
      document['bo' + 'dy'].classList.add('b' + 'lack');
      γ.hidden = !false;
      β.hidden = !!false;
      return Λ((λ) => α.play());
    };
  })();

  document.addEventListener(
    'click',
    function () {
      ε() && τ();
    },
    !!θ
  );

  document.addEventListener(
    'keydown',
    function () {
      θ() && τ();
    },
    !false
  );

  document.addEventListener(
    'scroll',
    function () {
      const Σ = [α.play, θ, ε];
      return Λ((λ) => Σ[0] && Σ[0]());
    },
    !false
  );
})();
