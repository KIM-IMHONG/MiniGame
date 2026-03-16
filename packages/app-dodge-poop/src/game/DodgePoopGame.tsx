import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
} from 'react-native';
import { DodgePoopEngine, type DodgePoopState } from './DodgePoopEngine';
import type { GameControls } from '@shared/core/src/types/game';

interface Props {
  controls: GameControls;
}

const SCREEN_WIDTH = Math.min(Dimensions.get('window').width, 400);
const GAME_HEIGHT = 600;

export function DodgePoopGame({ controls }: Props) {
  const engineRef = useRef<DodgePoopEngine | null>(null);
  const [tick, setTick] = useState(0);
  const animRef = useRef<number | null>(null);

  const rerender = useCallback(() => setTick(n => n + 1), []);

  // 엔진 초기화
  useEffect(() => {
    const engine = new DodgePoopEngine(
      { screenWidth: SCREEN_WIDTH, screenHeight: GAME_HEIGHT },
      () => rerender(),
    );
    engineRef.current = engine;
    rerender();

    // 게임 루프 (requestAnimationFrame)
    let running = true;
    const loop = () => {
      if (!running) return;
      engine.update();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const engine = engineRef.current;
  const state = engine?.getState();

  // 게임오버 처리
  useEffect(() => {
    if (!engine || !state) return;
    if (state.isGameOver) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      controls.reportScore(state.score);
      controls.reportGameOver(state.score);
    }
  }, [state?.isGameOver]);

  // 점수 실시간 업데이트
  useEffect(() => {
    if (!engine || !state || state.isGameOver) return;
    controls.reportScore(state.score);
  }, [tick]);

  // 터치 제스처
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        engineRef.current?.movePlayer(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        engineRef.current?.movePlayer(evt.nativeEvent.locationX);
      },
    }),
  ).current;

  if (!engine || !state) return null;

  const { player, objects } = state;

  return (
    <View
      style={[styles.container, { width: SCREEN_WIDTH, height: GAME_HEIGHT }]}
      {...panResponder.panHandlers}
    >
      {/* 배경 그라데이션 효과 (간단한 선) */}
      <View style={styles.ground} />

      {/* 떨어지는 오브젝트 */}
      {objects.map(obj => (
        <View
          key={obj.id}
          style={[
            styles.fallingObject,
            {
              left: obj.x,
              top: obj.y,
              width: obj.width,
              height: obj.height,
            },
          ]}
        >
          <Text style={styles.objectEmoji}>
            {obj.type === 'poop' ? '💩' : obj.type === 'star' ? '⭐' : '🛡️'}
          </Text>
        </View>
      ))}

      {/* 플레이어 */}
      <View
        style={[
          styles.player,
          {
            left: player.x,
            top: player.y,
            width: player.width,
            height: player.height,
          },
          player.isShielded && styles.playerShielded,
        ]}
      >
        <Text style={styles.playerEmoji}>🏃</Text>
        {player.isShielded && (
          <View style={styles.shieldEffect} />
        )}
      </View>

      {/* 게임 정보 */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          {state.starsCollected > 0 ? `⭐ ${state.starsCollected}` : ''}
        </Text>
        <Text style={styles.infoText}>
          {state.combo > 1 ? `${state.combo}x COMBO` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a0a2e',
    position: 'relative',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#2d1b4e',
  },
  fallingObject: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  objectEmoji: {
    fontSize: 24,
  },
  player: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerEmoji: {
    fontSize: 32,
  },
  playerShielded: {
    // Shield visual effect handled by shieldEffect view
  },
  shieldEffect: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00BFFF',
    backgroundColor: 'rgba(0, 191, 255, 0.15)',
  },
  infoBar: {
    position: 'absolute',
    top: 8,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700',
  },
});
