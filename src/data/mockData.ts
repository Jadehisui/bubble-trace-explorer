
import { TokenData } from '../types';

export const mockTokenData: Record<string, TokenData> = {
  'SHIB': {
    symbol: 'SHIB',
    name: 'Shiba Inu',
    wallets: [
      {
        id: '1',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        percentage: 25.5,
        tag: 'Oddy',
        x: 300,
        y: 200,
        connections: ['2', '3']
      },
      {
        id: '2',
        address: '0xabcdef1234567890abcdef1234567890abcdef12',
        percentage: 18.3,
        tag: 'Whale #1',
        x: 500,
        y: 300,
        connections: ['1', '4']
      },
      {
        id: '3',
        address: '0x9876543210fedcba9876543210fedcba98765432',
        percentage: 12.7,
        x: 200,
        y: 400,
        connections: ['1']
      },
      {
        id: '4',
        address: '0xfedcba9876543210fedcba9876543210fedcba98',
        percentage: 8.9,
        tag: 'Exchange',
        x: 600,
        y: 150,
        connections: ['2', '5']
      },
      {
        id: '5',
        address: '0x5555666677778888999900001111222233334444',
        percentage: 6.4,
        x: 400,
        y: 500,
        connections: ['4']
      },
      {
        id: '6',
        address: '0x1111222233334444555566667777888899990000',
        percentage: 4.2,
        x: 150,
        y: 250,
      },
      {
        id: '7',
        address: '0xaaaaaabbbbbbccccccddddddeeeeeeffffffffff',
        percentage: 3.1,
        x: 700,
        y: 400,
      }
    ]
  },
  'SUI': {
    symbol: 'SUI',
    name: 'Sui Network',
    wallets: [
      {
        id: '1',
        address: '0xsui1234567890abcdef1234567890abcdef123456',
        percentage: 35.2,
        tag: 'Foundation',
        x: 400,
        y: 300,
        connections: ['2', '3', '4']
      },
      {
        id: '2',
        address: '0xsui9876543210fedcba9876543210fedcba987654',
        percentage: 22.8,
        tag: 'Validator #1',
        x: 250,
        y: 200,
        connections: ['1']
      },
      {
        id: '3',
        address: '0xsuiabcdef1234567890abcdef1234567890abcdef',
        percentage: 15.6,
        x: 550,
        y: 180,
        connections: ['1', '4']
      },
      {
        id: '4',
        address: '0xsuifedcba9876543210fedcba9876543210fedcba',
        percentage: 11.3,
        tag: 'DEX Pool',
        x: 600,
        y: 350,
        connections: ['1', '3']
      },
      {
        id: '5',
        address: '0xsui5555666677778888999900001111222233334',
        percentage: 7.8,
        x: 300,
        y: 450,
      },
      {
        id: '6',
        address: '0xsui1111222233334444555566667777888899990',
        percentage: 4.5,
        x: 500,
        y: 480,
      }
    ]
  }
};
