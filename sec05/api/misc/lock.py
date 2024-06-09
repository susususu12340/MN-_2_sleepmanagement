# based on
# https://stackoverflow.com/questions/489861/locking-a-file-in-python

import os

try:
    # Posix based file locking (Linux, Ubuntu, MacOS, etc.)
    import fcntl

    def lock_file(f):
        if f.writable():
            fcntl.lockf(f, fcntl.LOCK_EX)

    def unlock_file(f):
        if f.writable():
            fcntl.lockf(f, fcntl.LOCK_UN)
except ModuleNotFoundError:
    # Windows file locking
    import msvcrt

    def file_size(f):
        return os.path.getsize(os.path.realpath(f.name))

    def lock_file(f):
        msvcrt.locking(f.fileno(), msvcrt.LK_RLCK, file_size(f))

    def unlock_file(f):
        msvcrt.locking(f.fileno(), msvcrt.LK_UNLCK, file_size(f))

FILE = '.lock'
fd = open(FILE, 'wt', encoding='ascii')


def lock():
    lock_file(fd)


def unlock():
    unlock_file(fd)
