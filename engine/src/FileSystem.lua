-- Type annotations only, no need to require this file.

-- https://github.com/miwos/firmware/blob/main/include/LuaFileSystem.h
---@class FileSystem
---@field listFiles fun(dirName: string): string[]
---@field fileExists fun(fileName: string): boolean
---@field writeFile fun(fileName: string, content: string)
FileSystem = {}
