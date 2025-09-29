<p align="center">
  <br>
  <img alt="Logo" src="media/logo.png">
  <br><br>
  <img alt="undefined" src="https://github.com/matu6968/edex-ui/actions/workflows/codeql-analysis.yml/badge.svg"/>
  <br>
  <a href="https://github.com/matu6968/edex-ui/releases/latest"><img alt="undefined" src="https://img.shields.io/github/release/matu6968/edex-ui.svg?style=popout"></a>
  <a href="#featured-in"><img alt="undefined" src="https://img.shields.io/github/downloads/GitSquared/edex-ui/total.svg?style=popout"></a>
  <a href="https://github.com/matu6968/edex-ui/blob/master/LICENSE"><img alt="undefined" src="https://img.shields.io/github/license/GitSquared/edex-ui.svg?style=popout"></a>
  <br>
  <a href="https://github.com/matu6968/edex-ui/releases/download/v2.3.2/eDEX-UI-Windows-x64.exe" target="_blank"><img alt="undefined" src="https://badgen.net/badge/Download/Windows x86_64/?color=blue&icon=windows&label"></a>
  <a href="https://github.com/matu6968/edex-ui/releases/download/v2.3.2/eDEX-UI-Windows-ia32.exe" target="_blank"><img alt="undefined" src="https://badgen.net/badge/Download/Windows x86/?color=blue&icon=windows&label"></a>
  <a href="https://github.com/matu6968/edex-ui/releases/download/v2.3.2/eDEX-UI-Windows-arm64.exe" target="_blank"><img alt="undefined" src="https://badgen.net/badge/Download/Windows ARM64/?color=blue&icon=windows&label"></a>
  <a href="https://github.com/matu6968/edex-ui/releases/download/v2.3.2/eDEX-UI-macOS-x64.dmg" target="_blank"><img alt="undefined" src="https://badgen.net/badge/Download/macOS x86_64/?color=grey&icon=apple&label"></a>
  <a href="https://github.com/matu6968/edex-ui/releases/download/v2.3.2/eDEX-UI-macOS-arm64.dmg" target="_blank"><img alt="undefined" src="https://badgen.net/badge/Download/macOS ARM64/?color=grey&icon=apple&label"></a>
  <a href="https://github.com/matu6968/edex-ui/releases/download/v2.3.2/eDEX-UI-Linux-x86_64.AppImage" target="_blank"><img alt="undefined" src="https://badgen.net/badge/Download/Linux x86_64/?color=orange&icon=terminal&label"></a>
  <a href="https://github.com/matu6968/edex-ui/releases/download/v2.3.2/eDEX-UI-Linux-arm64-AppImage" target="_blank"><img alt="undefined" src="https://badgen.net/badge/Download/Linux ARM64/?color=orange&icon=terminal&label"></a>
  <a href="https://github.com/matu6968/edex-ui/releases/download/v2.3.2/eDEX-UI-Linux-arm64-AppImage" target="_blank"><img alt="undefined" src="https://badgen.net/badge/Download/Linux ARMv7/?color=orange&icon=terminal&label"></a>
  <br>
  <br><br><br>
</p>

eDEX-UI is a fullscreen, cross-platform terminal emulator and system monitor that looks and feels like a sci-fi computer interface. It is a fork of [eDEX-UI](https://github.com/GitSquared/edex-ui) by [Gabriel 'Squared' SAILLARD](https://gaby.dev) with the goal of making updating dependencies to their latest versions with fixes needed for the latest versions of Electron, Node.js and several other dependencies like geolite2-redist.

---

<a href="https://youtu.be/BGeY1rK19zA">
  <img align="right" width="400" alt="Demo on YouTube" src="media/youtube-demo-teaser.gif">
</a>

Heavily inspired from the [TRON Legacy movie effects](https://web.archive.org/web/20170511000410/http://jtnimoy.com/blogs/projects/14881671) (especially the [Board Room sequence](https://gmunk.com/TRON-Board-Room)), the eDEX-UI project was originally meant to be *"[DEX-UI](https://github.com/seenaburns/dex-ui) with less « art » and more « distributable software »"*.

While keeping a futuristic look and feel, it strives to maintain a certain level of functionality and to be usable in real-life scenarios, with the larger goal of bringing science-fiction UXs to the mainstream.

<br>

It might or might not be a joke taken too seriously.


---

<p align="center">
  <em>Jump to: <br><a href="#features">Features</a> — <a href="#screenshots">Screenshots</a> — <a href="#qa">Questions & Answers</a> — <strong><a href="#how-do-i-get-it">Download</a></strong> — <a href="#featured-in">Featured In</a> — <a href="#useful-commands-for-the-nerds">Contributor Instructions</a> — <a href="#credits">Credits</a></em>
</p>

## Sponsor

**Want to help support my open-source projects?**

Click the Sponsor button above to sponsor my open-source projects.

## Features
- Fully featured terminal emulator with tabs, colors, mouse events, and support for `curses` and `curses`-like applications.
- Real-time system (CPU, RAM, swap, processes) and network (GeoIP, active connections, transfer rates) monitoring.
- Full support for touch-enabled displays, including an on-screen keyboard.
- Directory viewer that follows the CWD (current working directory) of the terminal.
- Advanced customization using themes, on-screen keyboard layouts, CSS injections. See the [wiki](https://github.com/GitSquared/edex-ui/wiki) for more info.
- Optional sound effects made by a talented sound designer for maximum hollywood hacking vibe.

## Screenshots
![Default screenshot](media/screenshot_default.png)

_[neofetch](https://github.com/dylanaraps/neofetch) on eDEX-UI 2.2 with the default "tron" theme & QWERTY keyboard_

![Blade screenshot](media/screenshot_blade.png)

_Checking out available themes in [eDEX's config dir](https://github.com/GitSquared/edex-ui/wiki/userData) with [`ranger`](https://github.com/ranger/ranger) on eDEX-UI 2.2 with the "blade" theme_

![Disrupted screenshot](media/screenshot_disrupted.png)

_[cmatrix](https://github.com/abishekvashok/cmatrix) on eDEX-UI 2.2 with the experimental "tron-disrupted" theme, and the user-contributed DVORAK keyboard_

![Horizon screenshot](media/screenshot_horizon.png)

_Editing eDEX-UI source code with `nvim` on eDEX-UI 2.2 with the custom [`horizon-full`](https://github.com/GitSquared/horizon-edex-theme) theme_

## Q&A
#### How do I get it?
Click on the little badges under the eDEX logo at the top of this page, or go to the [Releases](https://github.com/GitSquared/edex-ui/releases) tab, or download it through [one of the available repositories](https://repology.org/project/edex-ui/versions) (Homebrew, AUR...).

Public release binaries are unsigned ([why](https://web.archive.org/web/20241204064244/https://gaby.dev/posts/code-signing)). On Linux, you will need to `chmod +x` the AppImage file in order to run it.
#### I have a problem!
Search through the [Issues](https://github.com/matu6968/edex-ui/issues) to see if yours has already been reported. If you're confident it hasn't been reported yet, feel free to open up a new one. If you see your issue and it's been closed, it probably means that the fix for it will ship in the next version, and you'll have to wait a bit.
#### Can you disable the keyboard/the filesystem display?
Yes! You can now completely disable the keyboard and/or filesystem display through the settings. Open the settings editor (Ctrl+Shift+S) and set `disableKeyboard` and/or `disableFilesystem` to `true`. When disabled, the remaining component will expand to fill the available space. You can also hide them using CSS themes like `tron-notype`.
#### Why is the file browser saying that "Tracking Failed"? (Resolved!)
eDEX now supports filesystem tracking on all platforms including Windows! The filesystem browser will automatically follow your current working directory as you navigate through folders in the terminal. On Linux and macOS, this is achieved by monitoring the process working directory. On Windows, eDEX intelligently parses terminal output to detect directory changes from PowerShell and Command Prompt. If tracking still fails in rare cases, the file browser will fall back to a "detached" mode where you can still browse files & directories and click on files to input their path in the terminal.
#### Can this run on a Raspberry Pi / ARM device?
We provide prebuilt arm64 and armv7 builds as a part of the revival of the project.
#### Why is WebGL acceleration on the terminal disabled?
WebGL acceleration on the terminal is disabled because it's causing blue tint issues which in itself is caused by transparency issues (likely due to changing API's in xterm 5.x releases on how themes are handled). For now it is using software rendering instead which is slower but works.
#### Why isn't geolocation working?
It works, you just need to wait a little bit longer (around 15 seconds) for the database to download due to the size of the database present in newer versions of geolite2-redist.

<img width="220" src="https://78.media.tumblr.com/35d4ef4447e0112f776b629bffd99188/tumblr_mk4gf8zvyC1s567uwo1_500.gif" />


## Featured in...
- [Linux Uprising Blog](https://www.linuxuprising.com/2018/11/edex-ui-fully-functioning-sci-fi.html)
- [My post on r/unixporn](https://www.reddit.com/r/unixporn/comments/9ysbx7/oc_a_little_project_that_ive_been_working_on/)
- [Korben article (in french)](https://korben.info/une-interface-futuriste-pour-vos-ecrans-tactiles.html)
- [Hacker News](https://news.ycombinator.com/item?id=18509828)
- [This tweet that made me smile](https://twitter.com/mikemaccana/status/1065615451940667396)
- [BoingBoing article](https://boingboing.net/2018/11/23/simulacrum-sf.html) - Apparently i'm a "French hacker"
- [OReilly 4 short links](https://www.oreilly.com/ideas/four-short-links-23-november-2018)
- [Hackaday](https://hackaday.com/2018/11/23/look-like-a-movie-hacker/)
- [Developpez.com (another french link)](https://www.developpez.com/actu/234808/Une-application-de-bureau-ressemble-a-une-interface-d-ordinateur-de-science-fiction-inspiree-des-effets-du-film-TRON-Legacy/)
- [GitHub Blog's Release Radar November 2018](https://blog.github.com/2018-12-21-release-radar-november-2018/)
- [opensource.com Productive Tools for 2019](https://opensource.com/article/19/1/productivity-tool-edex-ui)
- [O'Reilly 4 short links (again)](https://www.oreilly.com/radar/four-short-links-7-july-2020/)
- [LinuxLinks](https://www.linuxlinks.com/linux-candy-edex-ui-sci-fi-computer-terminal-emulator-system-monitor/)
- [Linux For Everyone (Youtube)](https://www.youtube.com/watch?v=gbzqCAjm--g)
- [BestOfJS Rising Stars 2020](https://risingstars.js.org/2020/en#edex-ui)
- [The Geek Freaks (Youtube/German)](https://youtu.be/TSjMIeLG0Sk)
- [JSNation Open Source Awards 2021](https://osawards.com/javascript/#nominees) (Nominee - Fun Side Project of the Year)


## Useful commands for the nerds

**IMPORTANT NOTE:** the following instructions are meant for running eDEX from the latest unoptimized, unreleased, development version. If you'd like to get stable software instead, refer to [these](#how-do-i-get-it) instructions.

#### Starting from source:
on *nix systems (You'll need the Xcode command line tools on macOS):
- clone the repository
- `npm run install-linux`
- `npm run start`

on Windows:
- start cmd or powershell **as administrator**
- clone the repository
- `npm run install-windows`
- `npm run start`

#### Building
Note: Due to native modules, you can only build targets for the host OS you are using.

- `npm install` (NOT `install-linux` or `install-windows`)
- `npm run build-linux` or `build-windows` or `build-darwin`

The script will minify the source code, recompile native dependencies and create distributable assets in the `dist` folder.

#### Getting the bleeding edge
If you're interested in running the latest in-development version but don't want to compile source code yourself, you can can get pre-built nightly binaries on [GitHub Actions](https://github.com/matu6968/edex-ui/actions): click the latest commits, and download the artifacts bundle for your OS.

## Credits
eDEX-UI's source code was primarily written by [Squared](https://github.com/GitSquared). If you want to get in touch with him or find other projects he's involved in, check out [his website](https://gaby.dev).

[PixelyIon](https://github.com/PixelyIon) helped me get started with Windows compatibility and offered some precious advice when I started to work on this project seriously.

[IceWolf](https://soundcloud.com/iamicewolf) composed the sound effects on v2.1.x and above. He makes really cool stuff, check out his music!

## Thanks
Of course, eDEX would never have existed if I hadn't stumbled upon the amazing work of [Seena](https://github.com/seenaburns) on [r/unixporn](https://reddit.com/r/unixporn).

This project uses a bunch of open-source libraries, frameworks and tools, see [the full dependency graph](https://github.com/matu6968/edex-ui/network/dependencies).

I want to namely thank the developers behind [xterm.js](https://github.com/xtermjs/xterm.js), [systeminformation](https://github.com/sebhildebrandt/systeminformation) and [SmoothieCharts](https://github.com/joewalnes/smoothie).

Huge thanks to [Rob "Arscan" Scanlon](https://github.com/arscan) for making the fantastic [ENCOM Globe](https://github.com/arscan/encom-globe), also inspired by the TRON: Legacy movie, and distributing it freely. His work really puts the icing on the cake.

## Licensing

Licensed under the [GPLv3.0](https://github.com/matu6968/edex-ui/blob/master/LICENSE).
