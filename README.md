## Prerequisites
To use the proxy ssl has to be disabled. In example by compiling [this wrapper](https://github.com/SliveredMindOps/WinInetWrapper) (Release x64), copying the dll into the game directory
and editing your hosts file like this:
```
192.168.1.90 d2cgv6cqxnj0mc.cloudfront.net
192.168.1.90 prds.lid.gungho.jp
192.168.1.90 d1lys6imrj0r6g.cloudfront.net
```

## Replay and the creation of a private server
At the time of writing the game deploys multiple security mechanisms
- a driver which disables the creation of handles
- the game binary is encrypted and gets decrypted during runtime
- requests are hashed and the client checks the hash received by the server and vice versa

To be able to create or modify the game traffic the verification mechanism has to be either disabled in the client or reconstructed on the server.

## Notes
Neither the game nor the driver seem to verify the validity of the loaded modules which makes it possible to abuse the loading of proxydlls.
(See https://docs.microsoft.com/en-us/windows/win32/dlls/dynamic-link-library-search-order)
