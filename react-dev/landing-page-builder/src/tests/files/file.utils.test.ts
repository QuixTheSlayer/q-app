import { describe, it, expect } from 'vitest'
import { sliceFileExtension, readFileExtension, convertFileSize, renameFile } from '@/utils/file.utils'

describe('sliceFileExtension', () => {
  it('removes the final extension from a filename', () => {
    expect(sliceFileExtension('document.pdf')).toBe('document')
    expect(sliceFileExtension('archive.tar.gz')).toBe('archive.tar')
  })

  it('returns the original filename when there is no extension', () => {
    expect(sliceFileExtension('README')).toBe('README')
  })

  it('returns an empty string for falsy input', () => {
    expect(sliceFileExtension('')).toBe('')
  })
})

describe('readFileExtension', () => {
  it('returns the extension without the leading dot', () => {
    expect(readFileExtension('photo.jpg')).toBe('jpg')
    expect(readFileExtension('archive.tar.gz')).toBe('gz')
  })

  it('returns the filename itself when there is no dot', () => {
    expect(readFileExtension('README')).toBe('README')
  })
})

describe('convertFileSize', () => {
  it('converts bytes to kilobytes', () => {
    expect(convertFileSize(2048, { from: 'B', to: 'KB' })).toBe(2)
  })

  it('converts megabytes to bytes', () => {
    expect(convertFileSize(1, { from: 'MB', to: 'B' })).toBe(1024 * 1024)
  })

  it('converts between equal units unchanged', () => {
    expect(convertFileSize(100, { from: 'KB', to: 'KB' })).toBe(100)
  })

  it('rounds the result to two decimal places', () => {
    expect(convertFileSize(1, { from: 'B', to: 'KB' })).toBe(0)
    expect(convertFileSize(1500, { from: 'B', to: 'KB' })).toBe(1.46)
  })
})

describe('renameFile', () => {
  it('returns a new File with the given name and preserved type', () => {
    const original = new File(['content'], 'old-name.txt', { type: 'text/plain' })
    const renamed = renameFile(original, 'new-name.txt')

    expect(renamed.name).toBe('new-name.txt')
    expect(renamed.type).toBe('text/plain')
    expect(renamed.size).toBe(original.size)
  })

  it('preserves lastModified from the original file', () => {
    const original = new File(['content'], 'old-name.txt', { lastModified: 12345 })
    const renamed = renameFile(original, 'new-name.txt')

    expect(renamed.lastModified).toBe(12345)
  })
})
