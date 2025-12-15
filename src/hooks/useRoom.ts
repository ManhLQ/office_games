import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../config/firebase';
import type { Room } from '../types';

/**
 * Custom hook for subscribing to room data in Firebase
 * @param roomCode - The room code to subscribe to
 * @returns Room data, loading state, and error state
 */
export function useRoom(roomCode: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRoom(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const roomRef = ref(database, `rooms/${roomCode}`);

    const unsubscribe = onValue(
      roomRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setRoom(data as Room);
        } else {
          setRoom(null);
          setError('Room not found');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firebase error:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      off(roomRef);
      unsubscribe();
    };
  }, [roomCode]);

  return { room, loading, error };
}
