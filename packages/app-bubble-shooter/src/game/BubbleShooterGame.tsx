import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  Text,
} from 'react-native';
import { BubbleShooterEngine, type BubbleShooterState } from './BubbleShooterEngine';
import { getGridPosition } from './grid';
import { calculateAngle, generateAimDots } from './aiming';
import { BUBBLE_RENDER_COLORS } from './renderers/BubbleColors';
import { DEFAULT_CONFIG } from './types';
import type { Point } from './types';
import type { GameControls } from '@shared/core/src/types/game';

interface Props {
  controls: GameControls;
}

const SCREEN_WIDTH = Math.min(Dimensions.get('window').width, 400);
const LAUNCHER_Y_OFFSET = 80;

export function BubbleShooterGame({ controls }: Props) {
  const engineRef = useRef<BubbleShooterEngine | null>(null);
  const [gameState, setGameState] = useState<BubbleShooterState | null>(null);
  const [aimDots, setAimDots] = useState<Point[]>([]);
  const aimAngleRef = useRef<number | null>(null);

  // 엔진 초기화
  useEffect(() => {
    const engine = new BubbleShooterEngine(SCREEN_WIDTH, DEFAULT_CONFIG, (state) => {
      setGameState({ ...state });
      controls.reportScore(state.score);

      if (state.phase === 'gameover') {
        controls.reportGameOver(state.score);
      }
    });

    engineRef.current = engine;
    setGameState(engine.getState());
  }, []);

  const gridHeight = engineRef.current?.getGridHeight() ?? 500;
  const launcherX = SCREEN_WIDTH / 2;
  const launcherY = gridHeight + LAUNCHER_Y_OFFSET;

  // 터치 제스처 - useMemo로 launcherX/Y 변경시 재생성
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          const angle = calculateAngle(locationX, locationY, launcherX, launcherY);
          aimAngleRef.current = angle;
          setAimDots(generateAimDots(launcherX, launcherY, angle, SCREEN_WIDTH, 12));
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          const angle = calculateAngle(locationX, locationY, launcherX, launcherY);
          aimAngleRef.current = angle;
          setAimDots(generateAimDots(launcherX, launcherY, angle, SCREEN_WIDTH, 12));
        },
        onPanResponderRelease: () => {
          if (aimAngleRef.current !== null && engineRef.current) {
            engineRef.current.shoot(aimAngleRef.current);
          }
          aimAngleRef.current = null;
          setAimDots([]);
        },
      }),
    [launcherX, launcherY],
  );

  if (!gameState) return null;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* 격자 방울 렌더링 */}
      {gameState.grid.map((row, r) =>
        row.map((bubble, c) => {
          if (!bubble) return null;
          const pos = getGridPosition(r, c);
          const clr = BUBBLE_RENDER_COLORS[bubble.color];
          return (
            <View
              key={bubble.id}
              style={[
                styles.bubble,
                {
                  left: pos.x - DEFAULT_CONFIG.bubbleRadius,
                  top: pos.y - DEFAULT_CONFIG.bubbleRadius,
                  width: DEFAULT_CONFIG.bubbleRadius * 2,
                  height: DEFAULT_CONFIG.bubbleRadius * 2,
                  backgroundColor: clr.main,
                  borderColor: clr.dark,
                },
              ]}
            >
              <View style={[styles.highlight, { backgroundColor: clr.light }]} />
            </View>
          );
        }),
      )}

      {/* 조준선 점 */}
      {aimDots.map((dot, i) => (
        <View
          key={`dot-${i}`}
          style={[
            styles.aimDot,
            {
              left: dot.x - 3,
              top: dot.y - 3,
              opacity: 1 - i * 0.06,
            },
          ]}
        />
      ))}

      {/* 데드라인 */}
      <View
        style={[
          styles.deadline,
          {
            top: getGridPosition(DEFAULT_CONFIG.gameOverRow, 0).y - DEFAULT_CONFIG.bubbleRadius,
          },
        ]}
      />

      {/* 발사대 */}
      <View style={[styles.launcher, { top: launcherY - 20, left: launcherX - 20 }]}>
        <View
          style={[
            styles.launcherBubble,
            { backgroundColor: BUBBLE_RENDER_COLORS[gameState.currentBubble].main },
          ]}
        />
      </View>

      {/* 다음 방울 */}
      <View style={[styles.nextBubble, { top: launcherY + 10, left: launcherX + 40 }]}>
        <Text style={styles.nextLabel}>NEXT</Text>
        <View
          style={[
            styles.nextBubbleCircle,
            { backgroundColor: BUBBLE_RENDER_COLORS[gameState.nextBubble].main },
          ]}
        />
      </View>

      {/* 콤보 표시 */}
      {gameState.combo > 1 && (
        <View style={styles.comboContainer}>
          <Text style={styles.comboText}>{gameState.combo}x COMBO!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
    position: 'relative',
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlight: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 4,
    left: 6,
    opacity: 0.6,
  },
  aimDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  deadline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 71, 87, 0.4)',
    borderStyle: 'dashed',
  },
  launcher: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  launcherBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  nextBubble: {
    position: 'absolute',
    alignItems: 'center',
  },
  nextLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 8,
    marginBottom: 2,
  },
  nextBubbleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  comboContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  comboText: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});
