import React, { useMemo, useRef, useState } from 'react';
import './About3.css';

type StaticCardProps = {
  className?: string;
  style?: React.CSSProperties;
  symbolSrc: string;
  symbolName: string;
  cardRotation: number;
  cardDepth: number;
  hasShadow?: boolean;
  showCornerMarks?: boolean;
  cornerRankSrc?: string;
  cornerSuitSrc?: string;
};

const StaticCard: React.FC<StaticCardProps> = ({
  className,
  style,
  symbolSrc,
  symbolName,
  cardRotation,
  cardDepth,
  hasShadow = false,
  showCornerMarks = false,
  cornerRankSrc = '/img/card/K_filled.svg',
  cornerSuitSrc = '/img/card/heart_filled.svg',
}) => {
  const hasRotated = Math.abs(cardRotation) > 0.01;
  const baseSymbolLayout = [
    { left: '50%', top: '4%', zIndex: 5, rotate: '0deg', scale: 1.04 },
    { left: '58%', top: '38%', zIndex: 4, rotate: '20deg', scale: 1 },
    { left: '62%', top: '54%', zIndex: 3, rotate: '-15deg', scale: 1 },
    { left: '70%', top: '66%', zIndex: 2, rotate: '12deg', scale: 1 },
    { left: '64%', top: '86%', zIndex: 1, rotate: '-8deg', scale: 1 },
  ] as const;

  const symbolLayout =
    symbolName === 'Spade'
      ? ([
          ...baseSymbolLayout,
          { left: '46%', top: '46%', zIndex: 6, rotate: '8deg', scale: 1 },
          { left: '56%', top: '72%', zIndex: 2, rotate: '-6deg', scale: 1 },
        ] as const)
      : baseSymbolLayout;
  const motionSeeds = useMemo(
    () =>
      symbolLayout.map((_, index) => {
        // Deterministic pseudo-random seed per card/symbol so motion stays stable.
        const seedBase = `${symbolName}-${cardDepth}-${index}`;
        const hash = Array.from(seedBase).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const random = (multiplier: number, offset: number) =>
          (((hash * multiplier) % 97) / 97) * offset;
        return {
          fallSpeed: 0.85 + random(13, 0.7),
          driftStrength: 0.75 + random(17, 0.8),
          angleStrength: 0.7 + random(19, 0.7),
          transitionMs: 280 + Math.round(random(23, 260)),
          // K cards always participate in the bottom pile; others stay partially random.
          dropToBottom: symbolName === 'K' ? true : ((hash * 29) % 100) / 100 > 0.56,
          clingFactor: 0.12 + random(31, 0.2),
        };
      }),
    [symbolLayout, symbolName, cardDepth]
  );

  return (
    <div className={`about-card ${hasShadow ? 'about-card--elevated' : ''} ${className ?? ''}`.trim()} style={style}>
      {showCornerMarks ? (
        <>
          <img
            src={cornerRankSrc}
            alt=""
            aria-hidden="true"
            className="about-card-corner about-card-corner--rank-top-left"
          />
          <img
            src={cornerSuitSrc}
            alt=""
            aria-hidden="true"
            className="about-card-corner about-card-corner--top-left"
          />
          <img
            src={cornerRankSrc}
            alt=""
            aria-hidden="true"
            className="about-card-corner about-card-corner--rank-bottom-right"
          />
          <img
            src={cornerSuitSrc}
            alt=""
            aria-hidden="true"
            className="about-card-corner about-card-corner--bottom-right"
          />
        </>
      ) : null}
      <div className="about-stack" aria-label={`Stacked ${symbolName} logos`}>
        {symbolLayout.map((item, index) => {
          const seed = motionSeeds[index];
          const stackedDropCountBefore = motionSeeds
            .slice(0, index)
            .filter((previousSeed) => previousSeed.dropToBottom).length;
          const rotationMagnitude = Math.abs(cardRotation);
          const rotationSign = Math.sign(cardRotation || 1);
          const rotationInfluence = Math.min(1.25, rotationMagnitude / 26);
          const rotateDriftX =
            rotationSign *
            Math.min(82, rotationMagnitude * (0.58 + index * 0.06) * seed.driftStrength);
          const gravityBaseY = 8 + index * 3.5;
          const gravityFallY = Math.min(108, rotationMagnitude * (1.04 + index * 0.05) * seed.fallSpeed);
          const sideMomentumY = Math.min(28, Math.abs(rotateDriftX) * (0.22 + index * 0.022));
          const shouldDropToBottom = seed.dropToBottom && rotationMagnitude > (symbolName === 'K' ? 3 : 7);
          const dropBoostY = shouldDropToBottom
            ? Math.min(66, 26 + index * 6 + rotationMagnitude * 1.15 * seed.fallSpeed)
            : 0;
          const rotateDrift = cardRotation * (0.08 + index * 0.012) * seed.angleStrength;
          const pileSlots = [
            { x: -12, y: 62, angle: -22 },
            { x: 10, y: 56, angle: 16 },
            { x: -20, y: 50, angle: -14 },
            { x: 4, y: 44, angle: 20 },
            { x: -8, y: 38, angle: -8 },
          ] as const;
          const pileSlot = pileSlots[stackedDropCountBefore % pileSlots.length];
          const lateralIntensity = Math.min(1.9, 0.35 + rotationMagnitude / 18);

          const left = '50%';
          const top = '50%';
          const fallOffsetX = rotateDriftX * rotationInfluence * seed.clingFactor * lateralIntensity;
          const scale = hasRotated ? 1 - Math.min(0.09, index * 0.011 + cardDepth * 0.002) : 1;
          const rawOffsetY = hasRotated
            ? gravityBaseY + gravityFallY * rotationInfluence + sideMomentumY + dropBoostY
            : 0;
          // Drop symbols land into a bottom pile shape and stack in that pile.
          const dropLandingY = pileSlot.y;
          const isDropLanded = shouldDropToBottom && rawOffsetY >= dropLandingY;
          const landedSidePush = rotationSign * Math.min(26, rotationMagnitude * 0.55);
          const dropLandingX = pileSlot.x + landedSidePush;
          const rotate = hasRotated
            ? shouldDropToBottom && isDropLanded
              ? `${pileSlot.angle}deg`
              : `${rotateDrift}deg`
            : '0deg';
          const offsetX = hasRotated
            ? shouldDropToBottom
              ? isDropLanded
                ? dropLandingX
                : fallOffsetX
              : rotateDriftX * rotationInfluence * lateralIntensity
            : 0;
          // Hard-limit final Y so symbols cannot visually fall below the card bottom.
          const maxCardBottomY = 72;
          const nextOffsetY = shouldDropToBottom ? Math.min(dropLandingY, rawOffsetY) : rawOffsetY;
          const offsetY = Math.min(maxCardBottomY, nextOffsetY);

          return (
            <img
              key={`${symbolName}-${index}`}
              src={symbolSrc}
              alt={`${symbolName} logo`}
              className="about-stack-svg"
              style={{
                left,
                top,
                zIndex: item.zIndex,
                transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${rotate}) scale(${scale})`,
                transitionDuration: `${seed.transitionMs}ms`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const About: React.FC = () => {
  const cardConfigs = [
    { symbolSrc: '/img/card/K.svg', symbolName: 'K', zIndex: 1 },
    { symbolSrc: '/img/card/J.svg', symbolName: 'J', zIndex: 2 },
    { symbolSrc: '/img/card/heart.svg', symbolName: 'Heart', zIndex: 3 },
    { symbolSrc: '/img/card/spade.svg', symbolName: 'Spade', zIndex: 4 },
    { symbolSrc: '/img/card/K.svg', symbolName: 'K', zIndex: 5 },
  ] as const;
  const cardItems = cardConfigs.map((card, index) => ({
    ...card,
    cardKey: `${card.symbolName}-${card.zIndex}-${index}`,
  }));

  const [cardRotations, setCardRotations] = useState<Record<string, number>>({});
  const [currentCardIndex, setCurrentCardIndex] = useState(cardItems.length - 1);
  const [isRotating, setIsRotating] = useState(false);
  const rotateHandleRef = useRef({
    cardKey: '' as string,
    pointerX: 0,
    pointerY: 0,
    originRotation: 0,
  });

  const currentCard = cardItems[currentCardIndex];

  const handleRotateHandlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const targetCardKey = currentCard.cardKey;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    rotateHandleRef.current = {
      cardKey: targetCardKey,
      pointerX: event.clientX,
      pointerY: event.clientY,
      originRotation: cardRotations[targetCardKey] ?? 0,
    };
    setIsRotating(true);
  };

  const handleRotateHandlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!rotateHandleRef.current.cardKey) return;
    const dx = event.clientX - rotateHandleRef.current.pointerX;
    const dy = event.clientY - rotateHandleRef.current.pointerY;
    const nextRotation = rotateHandleRef.current.originRotation + dx * 0.24 + dy * 0.02;
    const targetCardKey = rotateHandleRef.current.cardKey;
    setCardRotations((previous) => ({
      ...previous,
      [targetCardKey]: nextRotation,
    }));
  };

  const endRotateHandleInteraction = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!rotateHandleRef.current.cardKey) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    rotateHandleRef.current.cardKey = '';
    setIsRotating(false);
  };

  const handlePreviousCard = () => {
    setCurrentCardIndex((previous) => (previous - 1 + cardItems.length) % cardItems.length);
  };

  const handleNextCard = () => {
    setCurrentCardIndex((previous) => (previous + 1) % cardItems.length);
  };

  return (
    <main className="about3-page">
      <div className="about3-box about3-box--interactive">
        <div className="about-controls" role="group" aria-label="Card controls">
          <button type="button" className="about-nav-handle" onClick={handlePreviousCard} aria-label="Previous card">
            <img src="/img/card/Left.svg" alt="" aria-hidden="true" className="about-nav-handle-icon" />
          </button>
          <div
            className={`about-rotate-handle ${isRotating ? 'about-rotate-handle--active' : ''}`}
            onPointerDown={handleRotateHandlePointerDown}
            onPointerMove={handleRotateHandlePointerMove}
            onPointerUp={endRotateHandleInteraction}
            onPointerCancel={endRotateHandleInteraction}
            aria-label="Rotate current card"
            role="button"
          >
            <img
              src="/img/card/ArrowArcLeft.svg"
              alt=""
              aria-hidden="true"
              className="about-rotate-handle-icon"
            />
          </div>
          <button type="button" className="about-nav-handle" onClick={handleNextCard} aria-label="Next card">
            <img src="/img/card/Right.svg" alt="" aria-hidden="true" className="about-nav-handle-icon" />
          </button>
        </div>
        {cardItems.map((card) => {
          const cardKey = card.cardKey;
          const rotation = cardRotations[cardKey] ?? 0;
          const hasMoved = Math.abs(rotation) > 0.01;
          const isCurrentCard = cardKey === currentCard.cardKey;
          return (
            <div
              key={cardKey}
              className={`about-card-layer ${isCurrentCard ? 'about-card-layer--current' : ''}`}
              style={{
                left: '50%',
                top: '50%',
                zIndex: isCurrentCard ? 20 : card.zIndex,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              }}
            >
              <div className="about-card-body">
                <StaticCard
                  symbolSrc={card.symbolSrc}
                  symbolName={card.symbolName}
                  cardRotation={rotation}
                  cardDepth={card.zIndex}
                  hasShadow={isCurrentCard || hasMoved}
                  showCornerMarks={
                    (card.symbolName === 'K' && (card.zIndex === 1 || card.zIndex === 5)) ||
                    (card.symbolName === 'J' && card.zIndex === 2) ||
                    (card.symbolName === 'Heart' && card.zIndex === 3) ||
                    (card.symbolName === 'Spade' && card.zIndex === 4)
                  }
                  cornerRankSrc={
                    card.symbolName === 'J'
                      ? '/img/card/J_filled.svg'
                      : card.symbolName === 'Heart'
                        ? '/img/card/5.svg'
                        : card.symbolName === 'Spade'
                          ? '/img/card/7.svg'
                          : '/img/card/K_filled.svg'
                  }
                  cornerSuitSrc={
                    card.symbolName === 'J' || card.symbolName === 'Spade'
                      ? '/img/card/spade_filled.svg'
                      : '/img/card/heart_filled.svg'
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default About;
