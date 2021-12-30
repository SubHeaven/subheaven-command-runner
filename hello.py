# -*- coding: utf-8 -*-
import json
import os
import sys
import time

def printHelp():
    print("    Script usado para testes. Cumprimenta alguém")
    print("")
    print("Exemplos:")
    print("    python hello.py  mensagem=\"Olá mundo!\"")
    print("    python hello.py  mensagem=\"Olá mundo!\" loop=10")
    print("    python hello.py  mensagem=\"Olá mundo!\" loop=10 --erro")
    print("")
    print("Parâmetros posicionais:")
    print("")
    print("Parâmetros nomeados:")
    print("    mensagem:  Mensagem a ser mostrada.")
    print("    loop: (Optional. Default=1) Tamanho do loop a ser executado.")
    print("")
    print("Parâmetros booleanos:")
    print("    erro: (Optional. Default=False) Informa se o script deve gerar um erro.")

def tratarArgs():
    global params
    params = {
        "mensagem": "",
        "loop": 1,
        "erro": False
    }
    if len(sys.argv) > 1:
        if sys.argv[1] in ['?', 'help']:
            printHelp()
            return False
        else:
            for i in range(len(sys.argv)):
                if i > 0:
                    if sys.argv[i] in ['erro', '-erro', '--erro']:
                        params["erro"] = True
                    elif "=" in sys.argv[i]:
                        blocos = sys.argv[i].split('=')
                        if blocos[0] == 'mensagem':
                            params["mensagem"] = blocos[1]
                        elif blocos[0] == 'loop':
                            params["loop"] = int(blocos[1])
            if params['mensagem'] == "":
                printHelp()
                return False
            else:
                return True
    else:
        printHelp()
        return False

if __name__ == "__main__":
    contador = 0
    if tratarArgs():
        params['loop'] = int(params['loop'])
        while contador < params['loop']:
            contador += 1
            print(params['mensagem'])
            if params['erro']:
                contador.teste()
            time.sleep(1)