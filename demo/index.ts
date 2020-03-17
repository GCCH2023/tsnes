import { Screen } from './screen';
import { DisASM } from './disasm';
import { Palette } from './palette';
import { ParttenTable } from './partten-table';
import { PPURegister } from './ppu-register';
import { NameTable } from './name-table';
import { Status } from './status';
import { StandardControllerButton } from '../src/api/controller';
import { Emulator } from '../src';
import { CpuRegister } from './cpu-register';

const input = document.getElementById('file-input') as HTMLInputElement;
input.addEventListener('change', () => {
  input.disabled = true;

  const reader = new FileReader();
  const file = (input as any).files[0];
  let buffer = new Uint8Array();

  reader.readAsArrayBuffer(file);

  reader.onload = e => {
    const data = new Uint8Array(e.target.result as ArrayBuffer);
    const tmp = new Uint8Array(buffer.length + data.length);

    tmp.set(buffer);
    tmp.set(data, buffer.length);

    buffer = tmp;
  };

  reader.onloadend = () => {
    try {
      startGame(buffer);
    } catch (e) {
      // tslint:disable-next-line
      console.log(e);
      alert(e.message);
    }
  };
});

function startGame(nesData: Uint8Array) {
  const emulator = new Emulator(nesData);

  const status = new Status(emulator, document.getElementById('rom'));
  const screen = new Screen(emulator, document.getElementById('screen') as HTMLCanvasElement);
  const cpuRegister = new CpuRegister(emulator, document.getElementById('register'));
  const ppuRegister = new PPURegister(emulator, document.getElementById('ppu-register'));
  const disASM = new DisASM(emulator, document.getElementById('disasm'));
  const backgroundPalette = new Palette(emulator, document.getElementById('background-palette') as HTMLCanvasElement, 0x3F00);
  const spritePalette = new Palette(emulator, document.getElementById('sprite-palette') as HTMLCanvasElement, 0x3F10);
  const parttenTable1 = new ParttenTable(emulator, document.getElementById('partten-table1') as HTMLCanvasElement, 0x0000);
  const parttenTable2 = new ParttenTable(emulator, document.getElementById('partten-table2') as HTMLCanvasElement, 0x1000);
  const nameTable = new NameTable(emulator, document.getElementById('name-table') as HTMLCanvasElement);

  status.start();
  screen.start();

  const debug = document.getElementById('debug-ctrl') as HTMLInputElement;
  debug.addEventListener('change', (e: InputEvent) => {
    const elements = document.getElementsByClassName('debug');

    if (debug.checked) {
      cpuRegister.start();
      ppuRegister.start();
      disASM.start();
      backgroundPalette.start();
      spritePalette.start();
      parttenTable1.start();
      parttenTable2.start();
      nameTable.start();
    } else {
      cpuRegister.stop();
      ppuRegister.stop();
      disASM.stop();
      backgroundPalette.stop();
      spritePalette.stop();
      parttenTable1.stop();
      parttenTable2.stop();
      nameTable.stop();
    }

    for (let i = 0; i < elements.length; i++) {
      const element = elements.item(i) as HTMLDivElement;

      element.style.opacity = debug.checked ? '1' : '0';
    }
  });

  document.addEventListener('keydown', keyboardHandle);
  document.addEventListener('keyup', keyboardHandle);
  function keyboardHandle(e: KeyboardEvent) {
    let button: StandardControllerButton;
    switch (e.code) {
      case 'ArrowUp':
        button = StandardControllerButton.UP;
        break;
      case 'ArrowDown':
        button = StandardControllerButton.DOWN;
        break;
      case 'ArrowLeft':
        button = StandardControllerButton.LEFT;
        break;
      case 'ArrowRight':
        button = StandardControllerButton.RIGHT;
        break;
      case 'Enter':
        button = StandardControllerButton.START;
        break;
      case 'ShiftRight':
        button = StandardControllerButton.SELECT;
        break;
      case 'KeyZ':
        button = StandardControllerButton.A;
        break;
      case 'KeyX':
        button = StandardControllerButton.B;
        break;
      default:
        return;
    }

    emulator.standardController1.updateButton(button, e.type === 'keydown');
  }
}
